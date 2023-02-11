#include <PumpAutoSettingService.h>

PumpAutoSettingService::PumpAutoSettingService(TANK_DETAILS* tankdetails,
                                               PumpStartStopPointService* pumpSsService,
                                               AsyncWebServer* server,
                                               FS* fs,
                                               SecurityManager* securityManager) :
    _httpEndpoint(PumpAutoStart::read,
                  PumpAutoStart::update,
                  this,
                  server,
                  TIMING_DETAILS_SETTINGS_PATH,
                  securityManager,
                  AuthenticationPredicates::IS_AUTHENTICATED),
    _fsPersistence(PumpAutoStart::read, PumpAutoStart::update, this, fs, TIMING_DETAILS_SETTINGS_FILE),
    _last_millis(0) {
  tank = tankdetails;
  _pumpSsService = pumpSsService;
  _state.tank = tankdetails;
}

void PumpAutoSettingService::begin() {
  _fsPersistence.readFromFS();
}

void PumpAutoSettingService::loop() {
  unsigned long currentMillis = millis();
  if ((unsigned long)(currentMillis - _last_millis) >= RUN_DELAY_AUTO_START) {
    _last_millis = currentMillis;
    time_t now = time(nullptr);
    struct tm* t = localtime(&now);
    Serial.print("Year:");
    Serial.print(t->tm_year);
    if (t->tm_year < 2022 || tank->fault_relay || tank->fault_sensor || tank->fault_wire) {
      tank->auto_start = false;
      return;
    }
    tank->auto_start = true;
    for (TimeDetails timing : _state.timings) {
      Serial.print(" Hour:");
      Serial.print(t->tm_hour);
      Serial.print(" Minute:");
      Serial.print(t->tm_min);
      if (!tank->pump_running && (timing.weekAndState & (1 << 7)) && (timing.weekAndState & (1 >> t->tm_wday)) &&
          timing.hour == t->tm_hour && timing.minute == t->tm_min) {
        _pumpSsService->start();
      }
    }
  }
}