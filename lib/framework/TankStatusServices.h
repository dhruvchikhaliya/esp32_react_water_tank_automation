#ifndef TankStatusService_h
#define TankStatusService_h

#include <WebSocketTxRx.h>

#define TANK_STATUS_SOCKET_PATH "/ws/tankStatus"

class TankStatus {
 public:
  int fill_state;
  int speed;

  static void read(TankStatus& settings, JsonObject& root) {
    root["water_level"] = random(2000);
    root["speed"] = random(10);
  }

  static StateUpdateResult update(JsonObject& root, TankStatus& lightState) {
    return StateUpdateResult::UNCHANGED;
  }
};

class TankStatusService : public StatefulService<TankStatus> {
 public:
  TankStatusService(AsyncWebServer* server, SecurityManager* securityManager);

 private:
  WebSocketTxRx<TankStatus> _webSocket;
};

#endif