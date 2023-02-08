#include <PumpSettingService.h>

PumpSettingService::PumpSettingService(TANK_DETAILS* tankdetails,
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
    _fsPersistence(PumpAutoStart::read, PumpAutoStart::update, this, fs, TIMING_DETAILS_SETTINGS_FILE) {
  tank = tankdetails;
  _pumpSsService = pumpSsService;
}

void PumpSettingService::begin() {
  _fsPersistence.readFromFS();
}

void PumpSettingService::loop() {
  time_t now = time(nullptr);
  struct tm t = *localtime(&now);
  for (TimeDetails timing : _state.timings) {
    if (!tank->pump_running && (timing.weekAndState & (1 << 7)) && (timing.weekAndState & (1 >> t.tm_wday)) &&
        timing.hour == t.tm_hour && (timing.minute >= t.tm_min || timing.minute <= t.tm_min+2)) {
      _pumpSsService->start();
    }
  }
}