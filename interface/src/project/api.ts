import { AxiosPromise } from "axios";

import { AXIOS } from "../api/endpoints";
import { LightMqttSettings, TankStatusDetails } from "./types";

export function readLightState(): AxiosPromise<TankStatusDetails> {
  return AXIOS.get('/lightState');
}

export function readBrokerSettings(): AxiosPromise<LightMqttSettings> {
  return AXIOS.get('/brokerSettings');
}

export function updateBrokerSettings(lightMqttSettings: LightMqttSettings): AxiosPromise<LightMqttSettings> {
  return AXIOS.post('/brokerSettings', lightMqttSettings);
}
