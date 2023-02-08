
export interface index {
  i: number;
}

export interface SetTime {
  hour: number;
  minute: number;
}

interface AutoStartValues {
  hour: number;
  minute: number;
  weekAndState: number;
}
export interface AutoStartTiming {
  timing: AutoStartValues[];
}

export interface StopPoints {
  start: number;
  stop: number;
}

export interface LedColors {
  ideal: number;
  fault_sensor: number;
  pump_running: number;
  automatic_start: number;
  interface_open: number;
  brightness: number;
  system_error: number;
}