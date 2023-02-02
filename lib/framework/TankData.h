#ifndef TankData_h
#define TankData_h

class TANK_DETAILS {
 public:
  int level;
  float speed;
  int prv_level;

 public:
  TANK_DETAILS(int level, float speed, int prv_level) : level(level), speed(speed), prv_level(prv_level) {
  }
};

#endif
