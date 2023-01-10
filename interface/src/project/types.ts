export interface TankStatusDetails {
  water_level: number;
  speed: number;
}

export interface LightMqttSettings {
  unique_id: string;
  name: string;
  mqtt_path: string;
}
