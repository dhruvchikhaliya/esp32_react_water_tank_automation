#include <PumpSettingService.h>

PumpSettingService::PumpSettingService(AsyncWebServer* server, FS* fs, SecurityManager* securityManager) :
    _httpEndpoint(PumpAutoStart::read,
                  PumpAutoStart::update,
                  this,
                  server,
                  TIMING_DETAILS_SETTINGS_PATH,
                  securityManager,
                  AuthenticationPredicates::IS_AUTHENTICATED),
    _fsPersistence(PumpAutoStart::read, PumpAutoStart::update, this, fs, TIMING_DETAILS_SETTINGS_FILE) {
}

void PumpSettingService::begin() {
  _fsPersistence.readFromFS();
}