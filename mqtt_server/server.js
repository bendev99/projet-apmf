import mqtt from "mqtt";
import express from "express";
import http from "http";
import { Server } from "socket.io";

//  CONFIG
const MQTT_BROKER = "mqtt://10.201.24.48:1883"; // Adresse IP locale Mosquitto (IP du PC)
const MQTT_TOPIC = "capteurs/serveur"; // Le même topic que ton ESP32
const PORT = 5000;

// SERVEUR WEB + SOCKET.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adresse du frontend
    methods: ["GET", "POST"],
  },
});

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

client.on("message", (topic, message) => {
  const payload = message.toString();
  console.log(`Reçu sur ${topic}: ${payload}`);

  // On envoie la donnée à tous les clients React connectés
  io.emit("mqtt_message", { topic, value: payload });
});

//  SOCKET.IO
io.on("connection", (socket) => {
  console.log("Un client React est connecté");
});

//  LANCEMENT DU SERVEUR
server.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
});
