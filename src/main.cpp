#include <ESP8266React.h>
#include <PumpAutoSettingService.h>
#include <TankStatusServices.h>
#include <PumpStartStopPointService.h>
#include <PumpLightService.h>
#include <TankData.h>

#define SERIAL_BAUD_RATE 115200
#define SERIAL2_BAUD_RATE 9600
#define WINDOW_SIZE 30
#define START_READ (int)220
#define TANK_HEIGHT (int)1300
#define measurementInterval 5000

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
// Read sensor---------------------------------
void readSensor();
uint16_t READINGS[WINDOW_SIZE];
uint8_t idx;
int water_sum = 0;
unsigned long prv_millis_sensor = 0;
uint16_t SPEED_LEVEL[60];
unsigned long SPEED_TIME[60];
uint8_t s_i = 0;
unsigned long prv_millis_speed = 0;
//--------------------------------------------

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
  while (1) {
    if (tank.automatic) {
      pumpStartStopPointService.loop();
    }
    readSensor();
  }
}

void readSensor() {
  if (Serial2.available()) {
    int reading = getDistance();
    if (reading >= START_READ && reading <= 2000) {
      // Water level
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

      // Pump Speed
      unsigned long currentTime = millis();
      if (tank.level > tank.prv_level && (unsigned long)(currentTime - prv_millis_speed) >= measurementInterval) {
        float fillSpeed = (tank.level - tank.prv_level) / ((float)measurementInterval / 1000);
        tank.speed = (int)fillSpeed;
        prv_millis_speed = currentTime;
        tank.prv_level = tank.level;
      }

      // Sensor detect
      if (tank.fault_sensor) {
        tank.fault_sensor = false;
      }
    } else {
      tank.level = 3000;
      if (!tank.fault_sensor) {
        tank.fault_sensor = true;
      }
    }
    if (tank.fault_wire) {
      tank.fault_wire = false;
    }
    prv_millis_sensor = millis();
  } else if ((unsigned long)(millis() - prv_millis_sensor) >= 1000 && !tank.fault_wire) {
    tank.level = 3000;
    if (!tank.fault_wire) {
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