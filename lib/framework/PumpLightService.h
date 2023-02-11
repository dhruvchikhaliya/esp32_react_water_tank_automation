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
#define BRIGHTNESS 0xFF

#define LIGHT_COLOR_SETTINGS_FILE "/config/light.json"
#define LIGHT_COLOR_SETTINGS_PATH "/rest/light"

class LightColors {
 public:
  uint32_t ideal;
  uint32_t pump_running;
  uint32_t auto_start_disabled;
  uint32_t fault_sensor;
  uint32_t fault_relay;
  uint32_t fault_wire;

  static void read(LightColors& settings, JsonObject& root) {
    JsonArray colors = root.createNestedArray("colors");
    colors.add(settings.ideal);
    colors.add(settings.pump_running);
    colors.add(settings.auto_start_disabled);
    colors.add(settings.fault_sensor);
    colors.add(settings.fault_relay);
    colors.add(settings.fault_wire);
  }

  static StateUpdateResult update(JsonObject& root, LightColors& settings) {
    if (root["colors"].is<JsonArray>() && root["colors"].size() == 6) {
      JsonArray colors = root["colors"].as<JsonArray>();
      settings.ideal = (uint32_t)colors[0];
      settings.pump_running = (uint32_t)colors[1];
      settings.auto_start_disabled = (uint32_t)colors[2];
      settings.fault_sensor = (uint32_t)colors[3];
      settings.fault_relay = (uint32_t)colors[4];
      settings.fault_wire = (uint32_t)colors[5];
      return StateUpdateResult::CHANGED;
    }
    settings.ideal = 0x00FF00;
    settings.pump_running = 0x0000FF;
    settings.auto_start_disabled = 0x008491;
    settings.fault_sensor = 0xFFFF00;
    settings.fault_relay = 0xFF0000;
    settings.fault_wire = 0xFFC0CB;
    return StateUpdateResult::ERROR;
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
  unsigned long _last_millis;
  CRGB color;
};

#endif