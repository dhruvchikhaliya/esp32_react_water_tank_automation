import { AxiosPromise } from 'axios';
import { AutoStartTiming } from '../types';
import { AXIOS } from './endpoints';

export function updateAutoStartTiming(autoStartTiming: AutoStartTiming): AxiosPromise<AutoStartTiming> {
    return AXIOS.post('/autoStartTiming', autoStartTiming);
}

export function readAutoStartTiming(): AxiosPromise<AutoStartTiming> {
    return AXIOS.get('/autoStartTiming');
}