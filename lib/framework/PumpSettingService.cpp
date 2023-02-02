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
}