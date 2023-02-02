#ifndef PumpLightService_h
#define PumpLightService_h

#include <ArduinoJson.h>
#include <AsyncJson.h>
#include <SecurityManager.h>
#include <HttpEndpoint.h>
#include <FSPersistence.h>
#include <FastLED.h>
#include <TankData.h>

#define NUM_LEDS 1
#define LED_PIN 15

#define IDEAL_COLOR 10
#define PUMP_RUNNING_COLOT 40
#define INTERFACE_OPEN 40

#define LIGHT_COLOR_SETTINGS_FILE "/config/light.json"
#define LIGHT_COLOR_SETTINGS_PATH "/rest/light"

class Light {
 public:
  uint32_t fault_sensor;
  uint32_t fault_relay;
  uint32_t pump_running;
  uint32_t ideal;
  uint32_t automatic_start;
  uint32_t interface_open;
  uint8_t brightness;

 public:
  Light(uint32_t fault_sensor = 0,
        uint32_t fault_relay = 0,
        uint32_t pump_running = 0,
        uint32_t ideal = 0,
        uint32_t automatic_start = 0,
        uint32_t interface_open = 0,
        uint8_t brightness = 0) :
      fault_sensor(fault_sensor),
      fault_relay(fault_relay),
      pump_running(pump_running),
      ideal(ideal),
      automatic_start(automatic_start),
      interface_open(interface_open),
      brightness(brightness) {
  }
};

class LightColors {
 public:
  Light lights;

  static void read(LightColors& settings, JsonObject& root) {
    // root["start"] = settings.start;
    // root["stop"] = settings.stop;
  }

  static StateUpdateResult update(JsonObject& root, LightColors& settings) {
    // settings.start = root["start"] | PUMP_START_POINT;
    // settings.stop = root["stop"] | PUMP_STOP_POINT;
    return StateUpdateResult::CHANGED;
  }
};

class PumpLightService : public StatefulService<LightColors> {
 public:
  PumpLightService(TANK_DETAILS* tankdetails, AsyncWebServer* server, FS* fs, SecurityManager* securityManager);
  void begin();
  void loop();

 private:
  HttpEndpoint<LightColors> _httpEndpoint;
  FSPersistence<LightColors> _fsPersistence;
  TANK_DETAILS* tank;
};

#endif