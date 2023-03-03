#include <PumpStartStopPointService.h>

PumpStartStopPointService::PumpStartStopPointService(TANK_DETAILS* tankdetails,
                                                     AsyncWebServer* server,
                                                     FS* fs,
                                                     SecurityManager* securityManager) :
    _httpEndpoint(StartStopPoints::read,
                  StartStopPoints::update,
                  this,
                  server,
                  START_STOP_SETTINGS_PATH,
                  securityManager,
                  AuthenticationPredicates::IS_AUTHENTICATED),
    _fsPersistence(StartStopPoints::read, StartStopPoints::update, this, fs, START_STOP_SETTINGS_FILE),
    _last_millis(0) {
  tank = tankdetails;
  _state.tank = tankdetails;
}

void PumpStartStopPointService::begin() {
  pinMode(RELAY_PIN, OUTPUT);
  _fsPersistence.readFromFS();
}

bool PumpStartStopPointService::fault() {
  return (tank->fault_relay || tank->fault_sensor || tank->fault_wire);
}

void PumpStartStopPointService::start() {
  if (tank->level < _state.stop && !tank->pump_running && tank->ground_reserve && !fault()) {
    forceStart();
  }
}

void PumpStartStopPointService::stop() {
  if (tank->pump_running) {
    digitalWrite(RELAY_PIN, LOW);
    tank->pump_running = false;
  }
}

void PumpStartStopPointService::forceStart() {
  digitalWrite(RELAY_PIN, HIGH);
  tank->running_since = millis();
  tank->run_till = FULL_TANK_TIME * (1 - tank->level / 2000);
  if (tank->run_till <= 120) {
    tank->run_till += 120;
  }
  tank->pump_running = true;
}

void PumpStartStopPointService::forceStop() {
  digitalWrite(RELAY_PIN, LOW);
  tank->pump_running = false;
}

void PumpStartStopPointService::loop() {
  if (!tank->ground_reserve) {
    digitalWrite(RELAY_PIN, LOW);
    tank->pump_running = false;
    return;
  }

  unsigned long currentMillis = millis();
  if ((unsigned long)(currentMillis - _last_millis) >= RUN_DELAY_SS) {
    if (fault()) {
      forceStop();
    } else {
      if (tank->pump_running) {
        if (tank->level >= _state.stop) {
          forceStop();
        }
        if ((unsigned long)((currentMillis - tank->running_since) / 1000) >= tank->run_till) {
          forceStop();
          if (tank->level <= _state.stop) {
            tank->ground_reserve = false;
            tank->fault_relay = true;
          } else {
            tank->fault_relay = true;
          }
        }
      } else if (tank->level <= _state.start) {
        start();
        return;
      }
    }
    _last_millis = currentMillis;
  }
}