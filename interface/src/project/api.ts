import { AxiosPromise } from "axios";

import { AXIOS } from "../api/endpoints";
import { TankStatusDetails } from "./types";

export function readLightState(): AxiosPromise<TankStatusDetails> {
  return AXIOS.get('/lightState');
}
