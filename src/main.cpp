#include <ESP8266React.h>
#include <LightMqttSettingsService.h>
#include <LightStateService.h>
#include <PumpSettingService.h>
#include <TankStatusServices.h>
#include <PumpStartStopPointService.h>
#include <PumpLightService.h>
#include <TankData.h>

#define SERIAL_BAUD_RATE 115200
#define SERIAL2_BAUD_RATE 9600
#define WINDOW_SIZE 30

TANK_DETAILS tank(0, 0, 0);

AsyncWebServer server(80);
ESP8266React esp8266React(&server);
LightMqttSettingsService lightMqttSettingsService =
    LightMqttSettingsService(&server, esp8266React.getFS(), esp8266React.getSecurityManager());
LightStateService lightStateService = LightStateService(&server,
                                                        esp8266React.getSecurityManager(),
                                                        esp8266React.getMqttClient(),
                                                        &lightMqttSettingsService);
TankStatusService tankStatusService = TankStatusService(&tank, &server, esp8266React.getSecurityManager());
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

  // start the framework and demo project
  esp8266React.begin();

  // Pump
  pumpSettingService.begin();
  pumpStartStopPointService.begin();

  // // load the initial light settings
  // lightStateService.begin();

  // // start the light service
  // lightMqttSettingsService.begin();

  // start the server
  server.begin();

  xTaskCreatePinnedToCore(Services, "Task1", 18000, NULL, 1, &Task1, 0);
  delay(500);

  xTaskCreatePinnedToCore(TankController, "Task2", 2000, NULL, 1, &Task2, 1);
  delay(500);
}

void Services(void* pvParameters) {
  // run the framework's loop function
  while (1) {
    esp8266React.loop();
    tankStatusService.loop();
    vTaskDelay(1000);
  }
}

void TankController(void* pvParameters) {
  uint16_t READINGS[WINDOW_SIZE];
  unsigned long timming[WINDOW_SIZE];
  uint8_t idx;
  uint16_t water_sum = 0;
  unsigned long prv_millis = millis();
  while (1) {
    if (Serial2.available()) {
      water_sum -= READINGS[idx];
      READINGS[idx] = getDistance();
      timming[idx] = millis();
      water_sum += READINGS[idx];
      idx = (idx + 1) % WINDOW_SIZE;
      tank.level = water_sum / WINDOW_SIZE;

      tank.speed =
          abs(((tank.prv_level - tank.level) * 2500 * 3.14) / ((timming[idx] - timming[(idx - 1) % WINDOW_SIZE])));
      Serial.print(tank.level);
      Serial.print("....");
      Serial.println(tank.speed);
    }
    // if (idx == 0) {
    //   vTaskDelay(1000);
    // }
  }
}

void loop() {
  // esp8266React.loop();
  // // esp8266React.loop();
  // if (Serial2.available()) {
  //   water_level = getDistance();
  // }
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
    if (((h_data + l_data)) == sum) {
      return distance;
    }
  }
  return 0;
}