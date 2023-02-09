#ifndef TankStatusService_h
#define TankStatusService_h

#include <WebSocketTxRx.h>
#include <TankData.h>
#include <PumpStartStopPointService.h>

#define TANK_STATUS_SOCKET_PATH "/ws/tankStatus"

class TankStatus {
 public:
  int fill_state;
  int speed;
  bool run;

  static void read(TankStatus& settings, JsonObject& root) {
    root["water_level"] = settings.fill_state;
    root["speed"] = settings.speed;
    root["run"] = settings.speed;
  }

  static StateUpdateResult update(JsonObject& root, TankStatus& lightState) {
    return StateUpdateResult::UNCHANGED;
  }
};

class TankStatusService : public StatefulService<TankStatus> {
 public:
  TankStatusService(TANK_DETAILS* tankdetails,
                    PumpStartStopPointService* pumpSsService,
                    AsyncWebServer* server,
                    SecurityManager* securityManager);
  void loop();

 private:
  WebSocketTxRx<TankStatus> _webSocket;
  TANK_DETAILS* tank;
  PumpStartStopPointService* _pumpSsService;
  void onConfigUpdated();
};

#endif