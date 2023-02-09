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
  uint32_t interface_open;
  uint32_t fault_sensor;
  uint32_t fault_relay;

  static void read(LightColors& settings, JsonObject& root) {
    JsonArray colors = root.createNestedArray("colors");
    colors.add(settings.ideal);
    colors.add(settings.pump_running);
    colors.add(settings.interface_open);
    colors.add(settings.fault_sensor);
    colors.add(settings.fault_relay);
  }

  static StateUpdateResult update(JsonObject& root, LightColors& settings) {
    if (root["colors"].is<JsonArray>() && root["colors"].size() == 5) {
      JsonArray colors = root["root"].as<JsonArray>();
      settings.ideal = colors[0];
      settings.pump_running = colors[1];
      settings.interface_open = colors[2];
      settings.fault_sensor = colors[3];
      settings.fault_relay = colors[4];
      return StateUpdateResult::CHANGED;
    }
    settings.ideal = 0x00FF00;
    settings.pump_running = 0x0000FF;
    settings.interface_open = 0x008491;
    settings.fault_sensor = 0xFFFF00;
    settings.fault_relay = 0xFF0000;
    return StateUpdateResult::ERROR
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