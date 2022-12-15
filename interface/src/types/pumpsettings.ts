import exp from "constants";

export interface PumpSetting {
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