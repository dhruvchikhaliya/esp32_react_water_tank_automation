#include <TankStatusServices.h>

TankStatusService::TankStatusService(TANK_DETAILS* tankdetails,
                                     AsyncWebServer* server,
                                     SecurityManager* securityManager) :
    _webSocket(TankStatus::read,
               TankStatus::update,
               this,
               server,
               TANK_STATUS_SOCKET_PATH,
               securityManager,
               AuthenticationPredicates::IS_AUTHENTICATED) {
  tank = tankdetails;
}

void TankStatusService::loop() {
  update(
      [&](TankStatus& state) {
        state.fill_state = tank->level;
        state.speed = tank->speed;
        return StateUpdateResult::CHANGED;
      },
      "waterLevel");
}