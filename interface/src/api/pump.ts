import { AxiosPromise } from 'axios';
import { AutoStartTimingList } from '../types';
import { AXIOS } from './endpoints';

export function updateAutoStartTiming(autoStartTiming: AutoStartTimingList): AxiosPromise<AutoStartTimingList> {
    return AXIOS.post('/autoStartTiming', autoStartTiming);
}

export function readAutoStartTiming(): AxiosPromise<AutoStartTimingList> {
    return AXIOS.get('/autoStartTiming');
  }