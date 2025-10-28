#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

// === CONFIGURATION CAPTEUR DHT22 ===
#define DHTPIN 4           // GPIO utilisé pour DHT22
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// === CONFIGURATION WI-FI ===
const char* ssid = "Tenda_E030B0";
const char* password = "GenZ2025!Apmf";

// === CONFIGURATION BROKER MQTT ===
const char* mqtt_server = "192.168.1.106"; // IP du PC
const int mqtt_port = 1883;
const char* mqtt_topic = "capteurs/serveur";

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  Serial.print("Connexion au WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connecté !");
  Serial.print("Adresse IP de l’ESP32 : ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Boucle jusqu'à la reconnexion
  while (!client.connected()) {
    Serial.print("Connexion MQTT...");
    if (client.connect("ESP32Client")) {
      Serial.println("Connecté !");
    } else {
      Serial.print("Échec, rc=");
      Serial.print(client.state());
      Serial.println(" — nouvelle tentative dans 5 secondes");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();

  client.setServer(mqtt_server, mqtt_port); // ⚠️ À mettre avant client.connect()
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Lecture DHT22
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Erreur lecture DHT !");
    delay(2000);
    return;
  }

  // Création payload JSON
  String payload = String("{\"temperature\":") + t + ",\"humidity\":" + h + "}";

  // Affichage pour debug
  Serial.print("Envoi au serveur MQTT : ");
  Serial.println(payload);

  // Publication MQTT
  client.publish(mqtt_topic, payload.c_str());

  delay(5000); // Toutes les 5 secondes
}

