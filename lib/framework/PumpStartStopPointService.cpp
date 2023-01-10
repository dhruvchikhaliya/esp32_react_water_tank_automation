#include <PumpStartStopPointService.h>

PumpStartStopPointService::PumpStartStopPointService(AsyncWebServer* server, FS* fs, SecurityManager* securityManager) :
    _httpEndpoint(StartStopPoints::read,
                  StartStopPoints::update,
                  this,
                  server,
                  START_STOP_SETTINGS_PATH,
                  securityManager,
                  AuthenticationPredicates::IS_AUTHENTICATED),
    _fsPersistence(StartStopPoints::read, StartStopPoints::update, this, fs, START_STOP_SETTINGS_FILE) {
}

void PumpStartStopPointService::begin() {
  _fsPersistence.readFromFS();
}