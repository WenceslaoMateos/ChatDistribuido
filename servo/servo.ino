#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>

char ssid[] = "patronatofi";
char pass[] = "";

char addr[] = "mqtt.fi.mdp.edu.ar";
int port = 1883;
char id[] = "servo";

char location[] = "sala4";

char ledTopic[35];
char motorTopic[35];

int pin = 0;

int pause = 1000;

Servo servo;

WiFiClient wifiClient;
PubSubClient client;

void setup()
{
  sprintf(ledTopic, "ingenieria/anexo/%s/led", location);
  sprintf(motorTopic, "ingenieria/anexo/%s/motor", location);

  Serial.begin(9600);

  client.setClient(wifiClient);
  client.setServer(addr, port);
  client.setCallback(callback);
  
  servo.attach(pin);
  
  pinMode(LED_BUILTIN, OUTPUT);

  connection();
}

void loop()
{
  client.loop();
}

void callback(const char topic[], byte* payload, unsigned int length)
{
  StaticJsonBuffer<JSON_OBJECT_SIZE(2)> jb;
  JsonObject& obj = jb.parseObject((char*) payload);
  
  if (!strcmp(topic, ledTopic))
  {
    bool valor = obj["valor"];
    if (valor)
    {
      Serial.println("Prender LED");
      digitalWrite(LED_BUILTIN, LOW);
    }
    else
    {
      Serial.println("Apagar LED");
      digitalWrite(LED_BUILTIN, HIGH);
    }  
  }
    
  else if (!strcmp(topic, motorTopic))
  {
    int valor = obj["valor"];
    if (valor >= 0 && valor <= 180)
    {
      char msg[20];
      sprintf(msg, "Girar motor a %d", valor);
      Serial.println(msg);
      servo.write(valor);
    }
  }
}

void connection()
{
  WiFi.begin(ssid, pass);
  WiFi.setAutoReconnect(true);
  while (!WiFi.isConnected())
    delay(pause);
  Serial.println("Conectado a WiFi");

  while (!client.connect(id))
    delay(pause);
  Serial.println("Conectado a MQTT");
  
  while (!client.subscribe(ledTopic))
    delay(pause);
  Serial.println("Suscrito a LED");

  while (!client.subscribe(motorTopic))
    delay(pause);
  Serial.println("Suscrito a motor");
}
