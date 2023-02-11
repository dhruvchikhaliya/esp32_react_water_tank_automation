import { FC, useEffect, useState } from 'react';
import React from 'react';
import { Typography, Box, List, ListItem, ListItemText, Card, CardContent, duration, Grid, LinearProgress, Stack, Button, Switch, Checkbox, ListItemAvatar, Avatar, Divider, Theme, useTheme, CardActions } from '@mui/material';

import { BlockFormControlLabel, FormLoader, SectionContent } from '../components';
import { Arced } from '../gauge/arced';
import { Power } from '../gauge/power';
import { WEB_SOCKET_ROOT } from '../api/endpoints';
import { TankStatusDetails } from './types';
import { updateValue, useWs } from '../utils';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import StopIcon from '@mui/icons-material/Stop';
import { useSnackbar } from 'notistack';
import { Console } from 'console';
import { dark } from '@mui/material/styles/createPalette';
import TimerIcon from '@mui/icons-material/Timer';
import CableIcon from '@mui/icons-material/Cable';
import SensorsIcon from '@mui/icons-material/Sensors';
import ElectricMeterIcon from '@mui/icons-material/ElectricMeter';
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { ToggleSwitch } from './PumpTimingSettings';

export const LIGHT_SETTINGS_WEBSOCKET_URL = WEB_SOCKET_ROOT + "tankStatus";

var timeStamp = 0;

const TankStatus: FC = () => {
  const { connected, updateData, data } = useWs<TankStatusDetails>(LIGHT_SETTINGS_WEBSOCKET_URL);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  if (!connected || !data) {
    return (<FormLoader message="Connecting to WebSocket…" />);
  }

  const avtarStatusHighlight = (status: boolean, theme: Theme) => {
    switch (status) {
      case true:
        return theme.palette.secondary.main;
      case false:
        return theme.palette.success.main;
      default:
        return theme.palette.error.main;
    }
  };

  const sendStartStopRequest = () => {
    // var elapsedTime = Math.floor(Date.now() / 1000) - timeStamp;
    // if (elapsedTime <= 5) {
    //   enqueueSnackbar(`Too frequent clicks. Chill`, { variant: 'info' });
    //   return;
    // }
    timeStamp = Math.floor(Date.now() / 1000);
    data.run = true;

  };

  const secondsToString = (second: number): string => {
    const minutes = Math.floor(second / 60);
    const seconds = second - minutes * 60;
    return `${minutes}m : ${seconds}s`;
  };

  const fault = (): boolean => {
    return (data.fault_relay || data.fault_sensor || data.fault_wire);
  };

  const updateFormValue = updateValue(updateData);
  return (
    <SectionContent title='Information' titleGutter>
      {/* <BlockFormControlLabel
        control={
          <Switch
            name="run"
            checked={data.run}
            onChange={updateFormValue}
            color="primary"
          />
        }
        label="LED State?"
      /> */}
      <div className="grid grid-cols-1 md:grid-cols-3">

        <Card variant="outlined" sx={{ borderRadius: 5, margin: 2 }} >
          <CardContent sx={{ padding: 0 }} >
            <List>
              <ListItem >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: avtarStatusHighlight(false, theme) }}>
                    {data.run ? <PowerIcon /> : <PowerOffIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Pump Status" secondary={data.run ? `Running | ${secondsToString(data.running_since)}` : "Ideal"} />

                <ToggleSwitch
                  name="run"
                  checked={data.run}
                  onChange={updateFormValue}
                  disabled={fault()}
                />
              </ListItem>
              <Divider variant="fullWidth" component="li" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: avtarStatusHighlight(!data.auto_start, theme) }}>
                        <TimerIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Auto Start" secondary={data.auto_start ? "Active" : "Inactive"} />
                  </ListItem>
                  <Divider variant="fullWidth" component="li" />
                </div>
                <div>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: avtarStatusHighlight(data.fault_relay, theme) }}>
                        <ElectricMeterIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Relay" secondary={data.fault_relay ? "" : "Faulty"} />
                  </ListItem>
                  <Divider variant="fullWidth" component="li" />

                </div>
                <div>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: avtarStatusHighlight(data.fault_sensor, theme) }}>
                        <SensorsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Sensor" secondary={data.fault_sensor ? "Inactive" : "Active"} />
                  </ListItem>
                  <Divider className='block md:hidden' variant="fullWidth" component="li" />

                </div>
                <div>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: avtarStatusHighlight(data.fault_wire, theme) }}>
                        <CableIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Wire" secondary={data.fault_wire ? "Broken" : "Good"} />
                  </ListItem>
                </div>
              </div>
            </List>
          </CardContent>
          <CardActions sx={{ display: 'none' }}>
          </CardActions>
        </Card>


        <Card variant="outlined" sx={{ borderRadius: 5, margin: 2 }} >
          <CardContent >
            <Typography color="textSecondary" variant="body2" >
              STATUS
            </Typography>
            {(!connected || !data) ? <FormLoader message="Connecting to WebSocket…" /> :
              <><div className="mt-8">
                <Arced
                  value={fault() ? 0 : Math.round(data.water_level - 0) * (100) / 2000} />
              </div><Typography color="textprimary" align='center' sx={{ marginTop: 2 }}>
                  {fault() ? 0 : data.water_level} Liters
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
      </div>
    </SectionContent >
  );
};

export default TankStatus;
