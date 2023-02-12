#ifndef TankData_h
#define TankData_h

class TANK_DETAILS {
 public:
  int start_p;
  int stop_p;
  int level;
  int speed;
  int prv_level;
  bool pump_running;
  bool fault_relay;
  bool fault_sensor;
  bool fault_wire;
  bool auto_start;
  bool ground_reserve;
  bool automatic;
  unsigned long running_since;

 public:
  TANK_DETAILS(int start_p = 0,
               int stop_p = 0,
               int level = 0,
               int speed = 0,
               int prv_level = 0,
               bool pump_running = false,
               bool fault_relay = false,
               bool fault_sensor = false,
               bool fault_wire = false,
               bool auto_start = true,
               bool ground_reserve = true,
               bool automatic = true,
               unsigned long running_since = 0) :
      start_p(start_p),
      stop_p(stop_p),
      level(level),
      speed(speed),
      prv_level(prv_level),
      pump_running(pump_running),
      fault_relay(fault_relay),
      fault_sensor(fault_sensor),
      fault_wire(fault_wire),
      auto_start(auto_start),
      ground_reserve(ground_reserve),
      automatic(automatic),
      running_since(running_since) {
  }
};

#endif
