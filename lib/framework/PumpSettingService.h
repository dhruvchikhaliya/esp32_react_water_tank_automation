#ifndef PumpSettingService_h
#define PumpSettingService_h

#include <ArduinoJson.h>
#include <AsyncJson.h>
#include <SecurityManager.h>
#include <HttpEndpoint.h>
#include <FSPersistence.h>
#include <TankData.h>
#include <PumpStartStopPointService.h>

#define MAX_AUTOSTART 5
#define TIMING_DETAILS_SETTINGS_FILE "/config/autoStartTiming.json"
#define TIMING_DETAILS_SETTINGS_PATH "/rest/autoStartTiming"

class TimeDetails {
 public:
  uint8_t hour;
  uint8_t minute;
  uint8_t weekAndState;

 public:
  TimeDetails(uint8_t hour, uint8_t minute, uint8_t weekAndState) :
      hour(hour), minute(minute), weekAndState(weekAndState) {
  }
};

class PumpAutoStart {
 public:
  std::list<TimeDetails> timings;
  static void read(PumpAutoStart& settings, JsonObject& root) {
    JsonArray timings = root.createNestedArray("timing");
    for (TimeDetails timing : settings.timings) {
      JsonObject timeRoot = timings.createNestedObject();
      timeRoot["hour"] = timing.hour;
      timeRoot["minute"] = timing.minute;
      timeRoot["weekAndState"] = timing.weekAndState;
    }
  }

  static StateUpdateResult update(JsonObject& root, PumpAutoStart& settings) {
    if (root["timing"].is<JsonArray>()) {
      JsonArray temp = root["timing"].as<JsonArray>();
      if (temp.size() > MAX_AUTOSTART || temp.size() < 0) {
        return StateUpdateResult::ERROR;
      }
      settings.timings.clear();
      for (JsonVariant timing : root["timing"].as<JsonArray>()) {
        TimeDetails temp = TimeDetails(timing["hour"], timing["minute"], timing["weekAndState"]);
        settings.timings.push_back(temp);
      }
      return StateUpdateResult::CHANGED;
    }
    return StateUpdateResult::ERROR;
  }
};

class PumpSettingService : public StatefulService<PumpAutoStart> {
 public:
  PumpSettingService(TANK_DETAILS* tankdetails,
                     PumpStartStopPointService* pumpSsService,
                     AsyncWebServer* server,
                     FS* fs,
                     SecurityManager* securityManager);
  void begin();
  void loop();

 private:
  HttpEndpoint<PumpAutoStart> _httpEndpoint;
  FSPersistence<PumpAutoStart> _fsPersistence;
  PumpStartStopPointService* _pumpSsService;
  TANK_DETAILS* tank;
};

#endif
