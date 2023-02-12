export interface TankStatusDetails {
  water_level: number;
  speed: number;
  run: boolean;
  fault_sensor: boolean;
  fault_wire: boolean;
  fault_relay: boolean;
  auto_start: boolean;
  running_since: number;
  automatic: boolean;
  ground_reserve: boolean;
  start_p: number;
  stop_p: number;
}
