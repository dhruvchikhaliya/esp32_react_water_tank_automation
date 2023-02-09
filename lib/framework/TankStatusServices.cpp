#include <TankStatusServices.h>

TankStatusService::TankStatusService(TANK_DETAILS* tankdetails,
                                     PumpStartStopPointService* pumpSsService,
                                     AsyncWebServer* server,
                                     SecurityManager* securityManager) :
    _webSocket(TankStatus::read,
               TankStatus::update,
               this,
               server,
               TANK_STATUS_SOCKET_PATH,
               securityManager,
               AuthenticationPredicates::IS_AUTHENTICATED) {
  _pumpSsService = pumpSsService;
  addUpdateHandler([&](const String& originId) { onConfigUpdated(); }, false);
  tank = tankdetails;
}

void TankStatusService::onConfigUpdated() {
  _state.run ? _pumpSsService->start() : _pumpSsService->stop();
}

void TankStatusService::loop() {
  update(
      [&](TankStatus& state) {
        state.fill_state = tank->level;
        state.speed = tank->speed;
        state.run = tank->speed;
        return StateUpdateResult::CHANGED;
      },
      "waterLevel");
}