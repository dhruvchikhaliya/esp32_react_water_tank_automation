#include <TankStatusServices.h>

TankStatusService::TankStatusService(AsyncWebServer* server, SecurityManager* securityManager) :
    _webSocket(TankStatus::read,
               TankStatus::update,
               this,
               server,
               TANK_STATUS_SOCKET_PATH,
               securityManager,
               AuthenticationPredicates::IS_AUTHENTICATED) {
}