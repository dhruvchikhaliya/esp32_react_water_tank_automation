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
    _fsPersistence(StartStopPoints::read, StartStopPoints::update, this, fs, START_STOP_SETTINGS_FILE) {
  tank = tankdetails;
}

void PumpStartStopPointService::begin() {
  pinMode(RELAY_PIN, OUTPUT);
  _fsPersistence.readFromFS();
}

void PumpStartStopPointService::stop() {
  digitalWrite(RELAY_PIN, LOW);
  tank->pump_running = false;
}

void PumpStartStopPointService::start() {
  if (tank->level < _state.stop && !tank->pump_running) {
    digitalWrite(RELAY_PIN, HIGH);
    tank->running_since = millis();
    tank->pump_running = true;
  }
}

void PumpStartStopPointService::loop() {
  if (!tank->fault_relay) {
    if (tank->level <= _state.start && !tank->pump_running) {
      digitalWrite(RELAY_PIN, HIGH);
      tank->running_since = millis();
      tank->pump_running = true;
    }
    if (tank->level >= _state.stop && tank->pump_running) {
      digitalWrite(RELAY_PIN, LOW);
    }
  } else {
    if (tank->pump_running && (millis() - tank->running_since) / 1000 >= MAX_ALLOWED_RUN_TIME) {
      digitalWrite(RELAY_PIN, LOW);
      tank->fault_relay = true;
    }
  }
}