#ifndef TankStatusService_h
#define TankStatusService_h

#include <WebSocketTxRx.h>
#include <TankData.h>

#define TANK_STATUS_SOCKET_PATH "/ws/tankStatus"

class TankStatus {
 public:
  int fill_state;
  int speed;

  static void read(TankStatus& settings, JsonObject& root) {
    root["water_level"] = settings.fill_state;
    root["speed"] = settings.speed;
  }

  static StateUpdateResult update(JsonObject& root, TankStatus& lightState) {
    return StateUpdateResult::UNCHANGED;
  }
};

class TankStatusService : public StatefulService<TankStatus> {
 public:
  TankStatusService(TANK_DETAILS* tankdetails, AsyncWebServer* server, SecurityManager* securityManager);
  void loop();

 private:
  WebSocketTxRx<TankStatus> _webSocket;
  int* water_level_p;
  TANK_DETAILS* tank;
};

#endif