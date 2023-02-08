import { AxiosPromise } from 'axios';
import { AutoStartTiming, StopPoints, LedColors } from '../types';
import { AXIOS } from './endpoints';

export function updateAutoStartTiming(autoStartTiming: AutoStartTiming): AxiosPromise<AutoStartTiming> {
    return AXIOS.post('/autoStartTiming', autoStartTiming);
}

export function readAutoStartTiming(): AxiosPromise<AutoStartTiming> {
    return AXIOS.get('/autoStartTiming');
}

export function updateStartStopPoint(startStopPoint: StopPoints): AxiosPromise<StopPoints> {
    return AXIOS.post('/startStopPoint', startStopPoint);
}

export function readStartStopPoint(): AxiosPromise<StopPoints> {
    return AXIOS.get('/startStopPoint');
}

export function updateColorSetting(ledColors: LedColors): AxiosPromise<LedColors> {
    return AXIOS.post('/colorSetting', ledColors);
}

export function readColorSetting(): AxiosPromise<LedColors> {
    return AXIOS.get('/colorSetting');
}