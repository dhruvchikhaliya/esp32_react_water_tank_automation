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
               AuthenticationPredicates::IS_AUTHENTICATED),
    _last_millis(0) {
  _pumpSsService = pumpSsService;
  tank = tankdetails;
  _state.tank = tankdetails;
  _state._pumpSsService = pumpSsService;
}

void TankStatusService::loop() {
  unsigned long currentMillis = millis();
  if ((unsigned long)(currentMillis - _last_millis) >= RUN_DELAY_STATUS) {
    update(
        [&](TankStatus& state) {
          // if (state.tank->level != tank->level || state.tank->speed != tank->speed || state.run !=
          // tank->pump_running) {
          return StateUpdateResult::CHANGED;
          // }
          // return StateUpdateResult::UNCHANGED;
        },
        "waterLevel");
    _last_millis = currentMillis;
  }
}