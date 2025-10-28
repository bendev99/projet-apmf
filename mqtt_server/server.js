import mqtt from "mqtt";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import { Parser } from "json2csv";

import DonnerCapteur from "./models/DonnerCapteur.js";

//  CONFIG
const MQTT_BROKER = "mqtt://10.121.249.48:1883"; // Adresse IP locale Mosquitto (IP du PC)
const MQTT_TOPIC = "capteurs/serveur"; // Le même topic que ton ESP32
const PORT = 5001;
const MONGO_URI = "mongodb://localhost:27017/mqtt_data";

// SERVEUR WEB + SOCKET.IO
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }, // adapte si ton React tourne sur autre port
});

// MONGODB
mongoose
  .connect(MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("Erreur MongoDB:", err));

//  MQTT
const client = mqtt.connect(MQTT_BROKER);

client.on("connect", () => {
  console.log("Connecté au broker MQTT");
  client.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log(`Souscription à ${MQTT_TOPIC}`);
    }
  });
});

client.on("error", (err) => {
  console.error("Erreur connexion MQTT : ", err);
});

// Quand un message arrive, sauvegarde et émet via socket.io
client.on("message", async (topic, message) => {
  try {
    const raw = message.toString();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn("Payload non JSON, on tente d'extraire des nombres:", raw);
      return;
    }

    const { temperature, humidity } = parsed;
    if (typeof temperature !== "number" || typeof humidity !== "number") {
      console.warn("Données invalides:", parsed);
      return;
    }

    // Sauvegarde MongoDB
    const doc = new DonnerCapteur({ temperature, humidity });
    await doc.save();

    // Emit en temps réel (objet parsé)
    io.emit("mqtt_message", {
      topic,
      data: { temperature, humidity, timestamp: doc.timestamp },
    });

    console.log(`📩 Reçu sur ${topic}: ${raw} -> saved id=${doc._id}`);
  } catch (error) {
    console.error("Erreur traitement message MQTT:", error);
  }
});

// SOCKET.IO connection logging
io.on("connection", (socket) => {
  console.log("🔌 Client Socket.IO connecté:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client Socket.IO déconnecté:", socket.id);
  });
});

// API REST pour historique
app.get("/api/history", async (req, res) => {
  try {
    // paramètres optionnels: limit et since
    const limit = parseInt(req.query.limit || "5", 10);
    const results = await DonnerCapteur.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(results);
  } catch (err) {
    console.error("Erreur /api/history:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour exporter tout l'historique en CSV
app.get("/api/download", async (req, res) => {
  try {
    const data = await DonnerCapteur.find().sort({ timestamp: -1 }); // plus récent en premier
    if (!data || data.length === 0)
      return res.status(404).send("Aucune donnée à télécharger");

    // Convertir en CSV
    const fields = ["Date et Heure", "Température", "Humidité"];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("historique_capteurs.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Erreur export CSV:", err);
    res.status(500).send("Erreur serveur");
  }
});

// optionnel: route health
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// LANCE LE SERVEUR
server.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});
