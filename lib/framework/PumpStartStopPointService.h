#ifndef PumpStartStopPointService_h
#define PumpStartStopPointService_h

#include <ArduinoJson.h>
#include <AsyncJson.h>
#include <SecurityManager.h>
#include <HttpEndpoint.h>
#include <FSPersistence.h>
#include <TankData.h>

#ifndef PUMP_START_POINT
#define PUMP_START_POINT 700
#endif

#ifndef PUMP_STOP_POINT
#define PUMP_STOP_POINT 1900
#endif

#define FULL_TANK_TIME 1500  // In Seconds
#define RELAY_PIN 12
#define RUN_DELAY_SS 1000
#define START_STOP_SETTINGS_FILE "/config/startStopPoint.json"
#define START_STOP_SETTINGS_PATH "/rest/startStopPoint"

class StartStopPoints {
 public:
  uint16_t start;
  uint16_t stop;
  TANK_DETAILS* tank;

  static void read(StartStopPoints& settings, JsonObject& root) {
    root["start"] = settings.start;
    root["stop"] = settings.stop;
  }

  static StateUpdateResult update(JsonObject& root, StartStopPoints& settings) {
    settings.start = root["start"] | PUMP_START_POINT;
    settings.stop = root["stop"] | PUMP_STOP_POINT;
    settings.tank->start_p = settings.start;
    settings.tank->stop_p = settings.stop;
    return StateUpdateResult::CHANGED;
  }
};

class PumpStartStopPointService : public StatefulService<StartStopPoints> {
 public:
  PumpStartStopPointService(TANK_DETAILS* tankdetails,
                            AsyncWebServer* server,
                            FS* fs,
                            SecurityManager* securityManager);
  void begin();
  void loop();
  void start();
  void stop();
  void forceStart();
  void forceStop();
  bool fault();

 private:
  HttpEndpoint<StartStopPoints> _httpEndpoint;
  FSPersistence<StartStopPoints> _fsPersistence;
  TANK_DETAILS* tank;
  unsigned long _last_millis;
};

#endif