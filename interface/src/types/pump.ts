
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
  colors: number[];
}