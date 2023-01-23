#include <PumpLightService.h>

CRGB leds[NUM_LEDS];

PumpLightService::PumpLightService(AsyncWebServer* server, FS* fs, SecurityManager* securityManager) :
    _httpEndpoint(LightColors::read,
                  LightColors::update,
                  this,
                  server,
                  LIGHT_COLOR_SETTINGS_PATH,
                  securityManager,
                  AuthenticationPredicates::IS_AUTHENTICATED),
    _fsPersistence(LightColors::read, LightColors::update, this, fs, LIGHT_COLOR_SETTINGS_FILE) {
}

void PumpLightService::begin() {
  _fsPersistence.readFromFS();
  FastLED.addLeds<NEOPIXEL, LED_PIN>(leds, NUM_LEDS); 
  leds[0] = CRGB::White; FastLED; delay(30);
}