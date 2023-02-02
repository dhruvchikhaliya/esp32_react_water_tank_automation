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
  CRGB color;
  if (tank->fault_sensor) {
    color = CRGB(_state.lights.fault_sensor);
  } else if (tank->fault_relay) {
    color = CRGB(_state.lights.fault_relay);
  } else if (tank->pump_running) {
    color = CRGB(_state.lights.pump_running);
  } else if (!tank->fault_relay) {
    color = CRGB(_state.lights.ideal);
  } else if (tank->fault_relay) {
    color = CRGB(_state.lights.fault_relay);
  } else if (tank->fault_relay) {
    color = CRGB(_state.lights.fault_relay);
  }
  led[0] = color;
  FastLED.setBrightness(_state.lights.brightness);
  FastLED.show();
}