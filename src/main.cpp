#include <ESP8266React.h>
#include <PumpAutoSettingService.h>
#include <TankStatusServices.h>
#include <PumpStartStopPointService.h>
#include <PumpLightService.h>
#include <TankData.h>

#define SERIAL_BAUD_RATE 115200
#define SERIAL2_BAUD_RATE 9600
#define WINDOW_SIZE 10
#define START_READ (int)220
#define TANK_HEIGHT (int)1300

TANK_DETAILS tank;

AsyncWebServer server(80);
ESP8266React esp8266React(&server);
PumpLightService pumpLightService =
    PumpLightService(&tank, &server, esp8266React.getFS(), esp8266React.getSecurityManager());
PumpStartStopPointService pumpStartStopPointService =
    PumpStartStopPointService(&tank, &server, esp8266React.getFS(), esp8266React.getSecurityManager());
TankStatusService tankStatusService =
    TankStatusService(&tank, &pumpStartStopPointService, &server, esp8266React.getSecurityManager());
PumpAutoSettingService pumpAutoSettingService = PumpAutoSettingService(&tank,
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
  pumpAutoSettingService.begin();
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
    pumpAutoSettingService.loop();
    pumpLightService.loop();
    vTaskDelay(500);
  }
}

void TankController(void* pvParameters) {
  uint16_t READINGS[WINDOW_SIZE];
  unsigned long timming[WINDOW_SIZE];
  uint8_t idx;
  int water_sum = 0;
  unsigned long prv_millis_sensor = millis();
  while (1) {
    pumpStartStopPointService.loop();
    if (Serial2.available()) {
      prv_millis_sensor = millis();
      int reading = getDistance();
      if (reading >= START_READ && reading <= 2000) {
        if (reading <= START_READ) {
          reading = START_READ;
        }
        int empty_tank = (int)((reading - 210) * (float)(2000.0 / TANK_HEIGHT));
        reading = 2000 - ((empty_tank >= 2000) ? 2000 : empty_tank);

        water_sum -= READINGS[idx];
        READINGS[idx] = reading;
        water_sum += READINGS[idx];
        idx = (idx + 1) % WINDOW_SIZE;

        tank.level = (uint16_t)(water_sum / WINDOW_SIZE);
        tank.fault_sensor = false;
        tank.fault_wire = false;
      } else {
        tank.level = 3000;
        tank.fault_sensor = true;
      }
    } else if (millis() - prv_millis_sensor >= 1000 && !tank.fault_wire) {
      tank.level = 3000;
      tank.fault_wire = true;
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