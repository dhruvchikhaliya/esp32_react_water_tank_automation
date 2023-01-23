#include <ESP8266React.h>
#include <LightMqttSettingsService.h>
#include <LightStateService.h>
#include <PumpSettingService.h>
#include <TankStatusServices.h>
#include <PumpStartStopPointService.h>
#include <PumpLightService.h>

#define SERIAL_BAUD_RATE 115200

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

void setup() {
  // start serial and filesystem
  Serial.begin(SERIAL_BAUD_RATE);

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

  xTaskCreatePinnedToCore(Services, /* Task function. */
                          "Task1",  /* name of task. */
                          10000,    /* Stack size of task */
                          NULL,     /* parameter of the task */
                          1,        /* priority of the task */
                          &Task1,   /* Task handle to keep track of created task */
                          0);       /* pin task to core 0 */
  delay(500);

  // create a task that will be executed in the Task2code() function, with priority 1 and executed on core 1
  xTaskCreatePinnedToCore(TankController, /* Task function. */
                          "Task2",        /* name of task. */
                          10000,          /* Stack size of task */
                          NULL,           /* parameter of the task */
                          1,              /* priority of the task */
                          &Task2,         /* Task handle to keep track of created task */
                          1);             /* pin task to core 1 */
  delay(500);
}

void Services(void* pvParameters) {
  // run the framework's loop function
  esp8266React.loop();
}

void TankController(void* pvParameters) {
}

void loop() {
  
}