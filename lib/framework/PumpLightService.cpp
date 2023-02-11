#include <PumpLightService.h>

CRGB led[NUM_LEDS];

PumpLightService::PumpLightService(TANK_DETAILS* tankdetails,
                                   AsyncWebServer* server,
                                   FS* fs,
                                   SecurityManager* securityManager) :
    _httpEndpoint(LightColors::read,
                  LightColors::update,
                  this,
                  server,
                  LIGHT_COLOR_SETTINGS_PATH,
                  securityManager,
                  AuthenticationPredicates::IS_AUTHENTICATED),
    _fsPersistence(LightColors::read, LightColors::update, this, fs, LIGHT_COLOR_SETTINGS_FILE) {
  tank = tankdetails;
}

void PumpLightService::begin() {
  _fsPersistence.readFromFS();
  FastLED.addLeds<NEOPIXEL, LED_PIN>(led, NUM_LEDS);
}

void PumpLightService::loop() {
  unsigned long currentMillis = millis();
  unsigned long run = 1000;
  if ((unsigned long)(currentMillis - _last_millis) >= run) {
    _last_millis = currentMillis;
  }

  if (tank->fault_sensor) {
    color = CRGB(_state.fault_sensor);
  }
  if (tank->fault_wire) {
    color = CRGB(_state.fault_wire);
  }

  if (tank->fault_relay) {
    color = CRGB(_state.fault_relay);
  }

  if (tank->fault_relay) {
    color = CRGB(_state.auto_start_disabled);
  }

  if (tank->pump_running) {
    color = CRGB(_state.pump_running);
  } else {
    color = CRGB(_state.ideal);
  }

  led[0] = color;
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.show();
}