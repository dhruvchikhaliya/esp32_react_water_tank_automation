#ifndef PumpStartStopPointService_h
#define PumpStartStopPointService_h

#include <ArduinoJson.h>
#include <AsyncJson.h>
#include <SecurityManager.h>
#include <HttpEndpoint.h>
#include <FSPersistence.h>

#ifndef PUMP_START_POINT
#define PUMP_START_POINT 10
#endif

#ifndef PUMP_STOP_POINT
#define PUMP_STOP_POINT 40
#endif

#define START_STOP_SETTINGS_FILE "/config/startStopPoint.json"
#define START_STOP_SETTINGS_PATH "/rest/startStopPoint"



class StartStopPoints {
 public:
  uint8_t start;
  uint8_t stop;

  static void read(StartStopPoints& settings, JsonObject& root) {
    root["start"] = settings.start;
    root["stop"] = settings.stop;
  }

  static StateUpdateResult update(JsonObject& root, StartStopPoints& settings) {
    settings.start = root["start"] | PUMP_START_POINT;
    settings.stop = root["stop"] | PUMP_STOP_POINT;
    return StateUpdateResult::CHANGED;
  }
};

class PumpStartStopPointService : public StatefulService<StartStopPoints> {
 public:
  PumpStartStopPointService(AsyncWebServer* server, FS* fs, SecurityManager* securityManager);
  void begin();

 private:
  HttpEndpoint<StartStopPoints> _httpEndpoint;
  FSPersistence<StartStopPoints> _fsPersistence;
};

#endif