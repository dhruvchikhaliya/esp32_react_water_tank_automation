import { FC, useState } from 'react';
import React from 'react';
import { Typography, Box, List, ListItem, ListItemText, Card, CardContent, duration, Grid, LinearProgress, Stack, Button, Switch, Checkbox } from '@mui/material';

import { FormLoader, SectionContent } from '../components';
import { Arced } from '../gauge/arced';
import { Power } from '../gauge/power';
import { WEB_SOCKET_ROOT } from '../api/endpoints';
import { TankStatusDetails } from './types';
import { updateValue, useWs } from '../utils';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import StopIcon from '@mui/icons-material/Stop';
import { useSnackbar } from 'notistack';

export const LIGHT_SETTINGS_WEBSOCKET_URL = WEB_SOCKET_ROOT + "tankStatus";

var timeStamp = 0;

const TankStatus: FC = () => {
  const { connected, updateData, data } = useWs<TankStatusDetails>(LIGHT_SETTINGS_WEBSOCKET_URL);
  const { enqueueSnackbar } = useSnackbar();

  if (!connected || !data) {
    return (<FormLoader message="Connecting to WebSocket…" />);
  }


  const sendStartStopRequest = () => {
    var elapsedTime = Math.floor(Date.now() / 1000) - timeStamp;
    if (elapsedTime <= 5) {
      enqueueSnackbar(`Too frequent clicks. Chill`, { variant: 'info' });
      return;
    }
    timeStamp = Math.floor(Date.now() / 1000);
    data.run = !data.run;
    updateValue(updateData);

  };
  return (
    <SectionContent title='Information' titleGutter>
      <div className="grid grid-cols-1 md:grid-cols-3">
        <Card variant="outlined" sx={{ borderRadius: 5, margin: 2 }} >
          <CardContent >
            <Typography color="textSecondary" variant="body2" >
              STATUS
            </Typography>
            {(!connected || !data) ? <FormLoader message="Connecting to WebSocket…" /> :
              <><div className="mt-8">
                <Arced
                  value={Math.round(data.water_level - 0) * (100) / 2000} />
              </div><Typography color="textprimary" align='center' sx={{ marginTop: 2 }}>
                  {data.water_level} Liters
                </Typography></>}
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 5, margin: 2, display: 'inline-block' }} >
          <CardContent >
            <Typography color="textSecondary" variant="body2">
              SPEED
            </Typography>
            {(!connected || !data) ? <FormLoader message="Connecting to WebSocket…" /> :
              <>
                <div className="mt-4">
                  <Power value={data.speed} />
                </div>
                <Typography color="textprimary" align='center' sx={{ marginTop: 2 }}>
                  {data.speed} l/m
                </Typography></>}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 5, margin: 2, display: 'inline-block' }} >
          <CardContent >
            <Checkbox
              icon={<PlayCircleFilledIcon />}
              checkedIcon={< StopIcon />}
              checked={data.run}
              onChange={sendStartStopRequest} />
          </CardContent>
        </Card>
      </div>
    </SectionContent >
  );
};

export default TankStatus;
