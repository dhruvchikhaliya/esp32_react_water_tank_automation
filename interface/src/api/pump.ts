import { AxiosPromise } from 'axios';
import { AutoStartTiming, StopPoints } from '../types';
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