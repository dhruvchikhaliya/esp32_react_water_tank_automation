import exp from "constants";

export interface PumpTimingSetting {
  hour: number;
  minute: number;
  status: boolean;
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}
export interface index {
  i: number;
}
export interface SetTime {
  hour: number;
  minute: number;
}

export interface AutoStartTiming {
  hour: number;
  minute: number;
  weekAndState: number;
}
export interface AutoStartTimingList {
  timing: AutoStartTiming[];
}