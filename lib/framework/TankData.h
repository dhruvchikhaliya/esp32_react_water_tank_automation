#ifndef TankData_h
#define TankData_h

class TANK_DETAILS {
 public:
  int level;
  float speed;
  int prv_level;
  bool pump_running;
  bool fault_relay;
  bool fault_sensor;
  unsigned long running_since;

 public:
  TANK_DETAILS(int level = 0,
               float speed = 0,
               int prv_level = 0,
               bool pump_running = false,
               bool fault_relay = false,
               bool fault_sensor = false,
               unsigned long running_since = 0) :
      level(level),
      speed(speed),
      prv_level(prv_level),
      pump_running(pump_running),
      fault_relay(fault_relay),
      fault_sensor(fault_sensor),
      running_since(running_since) {
  }
};

#endif
