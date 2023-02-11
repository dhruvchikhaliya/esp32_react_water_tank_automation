#ifndef TankStatusService_h
#define TankStatusService_h

#include <WebSocketTxRx.h>
#include <TankData.h>
#include <PumpStartStopPointService.h>

#define TANK_STATUS_SOCKET_PATH "/ws/tankStatus"
#define RUN_DELAY_STATUS 500

class TankStatus {
 public:
  bool run;
  TANK_DETAILS* tank;
  PumpStartStopPointService* _pumpSsService;

  static void read(TankStatus& settings, JsonObject& root) {
    root["water_level"] = settings.tank->level;
    root["speed"] = settings.tank->speed;
    root["run"] = settings.tank->pump_running;
    root["fault_sensor"] = settings.tank->fault_sensor;
    root["fault_wire"] = settings.tank->fault_wire;
    root["fault_relay"] = settings.tank->fault_relay;
    root["auto_start"] = settings.tank->auto_start;
    root["running_since"] = (int)((millis() - settings.tank->running_since) / 1000);
  }

  static StateUpdateResult update(JsonObject& root, TankStatus& tankState) {
    bool run_n = root["run"];
    if (tankState.tank->pump_running != run_n) {
      run_n ? tankState._pumpSsService->start() : tankState._pumpSsService->stop();
      // tankState.run = run_n;
      return StateUpdateResult::CHANGED;
    }
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
  unsigned long _last_millis;
};

#endif