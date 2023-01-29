#include <ESP8266React.h>
#include <LightMqttSettingsService.h>
#include <LightStateService.h>
#include <PumpSettingService.h>
#include <TankStatusServices.h>
#include <PumpStartStopPointService.h>
#include <PumpLightService.h>

#define SERIAL_BAUD_RATE 115200
#define SERIAL2_BAUD_RATE 9600

int water_level = 2000;

AsyncWebServer server(80);
ESP8266React esp8266React(&server);
LightMqttSettingsService lightMqttSettingsService =
    LightMqttSettingsService(&server, esp8266React.getFS(), esp8266React.getSecurityManager());
LightStateService lightStateService = LightStateService(&server,
                                                        esp8266React.getSecurityManager(),
                                                        esp8266React.getMqttClient(),
                                                        &lightMqttSettingsService);
TankStatusService tankStatusService = TankStatusService(&server, esp8266React.getSecurityManager());
PumpLightService pumpLightService = PumpLightService(&server, esp8266React.getFS(), esp8266React.getSecurityManager());
PumpSettingService pumpSettingService =
    PumpSettingService(&server, esp8266React.getFS(), esp8266React.getSecurityManager());
PumpStartStopPointService pumpStartStopPointService =
    PumpStartStopPointService(&server, esp8266React.getFS(), esp8266React.getSecurityManager());

TaskHandle_t Task1;
TaskHandle_t Task2;

void Services(void* pvParameters);
void TankController(void* pvParameters);
int getDistance();

void setup() {
  // start serial and filesystem
  Serial.begin(SERIAL_BAUD_RATE);
  Serial2.begin(SERIAL2_BAUD_RATE);

  // // start the framework and demo project
  // esp8266React.begin();

  // // Pump
  // pumpSettingService.begin();
  // pumpStartStopPointService.begin();

  // // // load the initial light settings
  // // lightStateService.begin();

  // // // start the light service
  // // lightMqttSettingsService.begin();

  // // start the server
  // server.begin();

  // xTaskCreatePinnedToCore(Services, "Task1", 10000, NULL, 1, &Task1, 0);
  // delay(500);

  // xTaskCreatePinnedToCore(TankController, "Task2", 10000, NULL, 1, &Task2, 1);
  // delay(500);
}

void Services(void* pvParameters) {
  // run the framework's loop function
  esp8266React.loop();
}

void TankController(void* pvParameters) {
  if (Serial2.available()) {
    Serial.println(Serial2.read());
  }
}

void loop() {
  // esp8266React.loop();
  if (Serial2.available()) {
    water_level = getDistance();
  }
}
int getDistance() {
  unsigned int distance;
  byte startByte, h_data, l_data, sum = 0;
  byte buf[3];

  startByte = (byte)Serial2.read();
  if (startByte == 255) {
    Serial2.readBytes(buf, 3);
    h_data = buf[0];
    l_data = buf[1];
    sum = buf[2];
    distance = (h_data << 8) + l_data;
    if (((h_data + l_data)) != sum) {
    } else {
      return distance;
    }
  }  

  else
    return;
  delay(100);
}