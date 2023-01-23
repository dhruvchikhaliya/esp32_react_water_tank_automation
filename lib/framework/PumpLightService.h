#ifndef PumpLightService_h
#define PumpLightService_h

#include <ArduinoJson.h>
#include <AsyncJson.h>
#include <SecurityManager.h>
#include <HttpEndpoint.h>
#include <FSPersistence.h>
#include <FastLED.h>

#define NUM_LEDS 1
#define LED_PIN 2
CRGB leds[NUM_LEDS];

#define IDEAL_COLOR 10
#define PUMP_RUNNING_COLOT 40
#define INTERFACE_OPEN 40

#define LIGHT_COLOR_SETTINGS_FILE "/config/light.json"
#define LIGHT_COLOR_SETTINGS_PATH "/rest/light"

class Light {
 public:
  uint8_t color;
  uint8_t brightness;

 public:
  Light(uint8_t color, uint8_t brightness) :
      color(color), brightness(brightness)) {
  }
};

class LightColors {
 public:
    std::list<Light> lights;

  static void read(LightColors& settings, JsonObject& root) {
    root["start"] = settings.start;
    root["stop"] = settings.stop;
  }

  static StateUpdateResult update(JsonObject& root, LightColors& settings) {
    settings.start = root["start"] | PUMP_START_POINT;
    settings.stop = root["stop"] | PUMP_STOP_POINT;
    return StateUpdateResult::CHANGED;
  }
};

class PumpLightService : public StatefulService<LightColors> {
 public:
  PumpLightService(AsyncWebServer* server, FS* fs, SecurityManager* securityManager);
  void begin();

 private:
  HttpEndpoint<LightColors> _httpEndpoint;
  FSPersistence<LightColors> _fsPersistence;
};

#endif