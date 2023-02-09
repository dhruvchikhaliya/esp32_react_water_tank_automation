#include <ESP8266React.h>
#include <PumpSettingService.h>
#include <TankStatusServices.h>
#include <PumpStartStopPointService.h>
#include <PumpLightService.h>
#include <TankData.h>

#define SERIAL_BAUD_RATE 115200
#define SERIAL2_BAUD_RATE 9600
#define WINDOW_SIZE 30

TANK_DETAILS tank;

AsyncWebServer server(80);
ESP8266React esp8266React(&server);
TankStatusService tankStatusService = TankStatusService(&tank, &server, esp8266React.getSecurityManager());
PumpLightService pumpLightService =
    PumpLightService(&tank, &server, esp8266React.getFS(), esp8266React.getSecurityManager());
PumpStartStopPointService pumpStartStopPointService =
    PumpStartStopPointService(&tank, &server, esp8266React.getFS(), esp8266React.getSecurityManager());
PumpSettingService pumpSettingService = PumpSettingService(&tank,
                                                           &pumpStartStopPointService,
                                                           &server,
                                                           esp8266React.getFS(),
                                                           esp8266React.getSecurityManager());

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
  pumpLightService.begin();

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
    pumpLightService.loop();
    vTaskDelay(1000);
  }
}

void TankController(void* pvParameters) {
  uint16_t READINGS[WINDOW_SIZE];
  unsigned long timming[WINDOW_SIZE];
  uint8_t idx;
  uint16_t water_sum = 0;
  unsigned long prv_millis_relay = millis();
  unsigned long prv_millis_sensor = millis();
  while (1) {
    if (millis() - timming[idx] >= 1000) {
      tank.fault_sensor = true;
      pumpStartStopPointService.stop();
      while (!Serial2.available()) {
      }
      tank.fault_sensor = false;
    }

    if (millis() - prv_millis_relay >= 5000 && !tank.fault_sensor) {
      pumpStartStopPointService.loop();
      prv_millis_relay = millis();
    }

    if (Serial2.available()) {
      water_sum -= READINGS[idx];
      READINGS[idx] = getDistance();
      if (READINGS[idx] == 0) {
        pumpStartStopPointService.stop();
        tank.fault_sensor = true;
      } else {
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
    }
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
    if (((h_data + l_data)) == sum) {
      return distance;
    }
  }
  return 0;
}

void loop() {
}