/*
  ESP8266 + DHT11 Telemetry -> HTTP POST JSON
  - Reemplaza WIFI_SSID, WIFI_PASS y ENDPOINT_URL
  - Envía JSON: {"ts":"ISO8601","temp":..,"hum":..}
*/
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include "DHT.h"

#define DHTPIN D4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const char* WIFI_SSID = "TU_SSID";
const char* WIFI_PASS = "TU_PASS";
const char* ENDPOINT_URL = "https://TU_ENDPOINT/exec"; // Google Apps Script / Firebase HTTPS

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi OK");
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) { Serial.println("DHT error"); delay(2000); return; }

  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    http.begin(client, ENDPOINT_URL);
    http.addHeader("Content-Type", "application/json");

    // Construir JSON manualmente
    String payload = String("{\"ts\":\"") + String(millis()) + String("\",\"temp\":") + String(t,1) + String(",\"hum\":") + String(h,1) + String("}");
    int code = http.POST(payload);
    Serial.printf("POST %d %s\n", code, payload.c_str());
    http.end();
  }
  delay(30000); // cada 30s
}
