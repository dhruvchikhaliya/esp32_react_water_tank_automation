import { FC, useContext } from 'react';
import { Typography, List, ListItem, ListItemText, Card, CardContent,ListItemAvatar, Avatar, Divider, Theme, useTheme, CardActions, ListItemButton } from '@mui/material';

import { FormLoader, SectionContent } from '../components';
import { Arced } from '../gauge/arced';
import { Power } from '../gauge/power';
import { WEB_SOCKET_ROOT } from '../api/endpoints';
import { TankStatusDetails } from './types';
import { updateValue, useWs } from '../utils';
import { useSnackbar } from 'notistack';
import TimerIcon from '@mui/icons-material/Timer';
import CableIcon from '@mui/icons-material/Cable';
import SensorsIcon from '@mui/icons-material/Sensors';
import ElectricMeterIcon from '@mui/icons-material/ElectricMeter';
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { ToggleSwitch } from './PumpTimingSettings';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';
import WaterIcon from '@mui/icons-material/Water';
import { AuthenticatedContext } from '../contexts/authentication';

export const LIGHT_SETTINGS_WEBSOCKET_URL = WEB_SOCKET_ROOT + "tankStatus";

const TankStatus: FC = () => {
  const { connected, updateData, data } = useWs<TankStatusDetails>(LIGHT_SETTINGS_WEBSOCKET_URL);
  const { enqueueSnackbar } = useSnackbar();
  const authenticatedContext = useContext(AuthenticatedContext);
  const theme = useTheme();

  // useEffect(() => {
  //   updateValue(updateData);
  // }, [data]);

  if (!connected || !data) {
    return (<FormLoader message="Connecting to WebSocket…" />);
  }

  const avtarStatusHighlight = (status: boolean, theme: Theme) => {
    switch (status) {
      case true:
        return theme.palette.error.main;
      case false:
        return theme.palette.primary.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  const showGuestError = () => {
    enqueueSnackbar("Please login as admin", { variant: "warning" });
  };

  const changeAutoMode = () => {
    if (!authenticatedContext.me.admin) {
      showGuestError();
      return;
    }
    var temp = { ...data };
    temp.automatic = !temp.automatic;
    updateData(temp);
  };

  const secondsToString = (second: number): string => {
    const minutes = Math.floor(second / 60);
    const seconds = second - minutes * 60;
    return `${minutes}m : ${seconds}s`;
  };

  const fault = (): boolean => {
    return (data.fault_relay || data.fault_sensor || data.fault_wire || !data.ground_reserve);
  };


  const updateFormValue = authenticatedContext.me.admin ? updateValue(updateData) : showGuestError;

  return (
    <SectionContent title='Information' titleGutter>
      <div className="grid grid-cols-1 md:grid-cols-3">
        <Card variant="outlined" sx={{ borderRadius: 5, margin: 2 }} >
          <CardContent sx={{ padding: 0 }} >
            <List>
              <ListItem
                secondaryAction={
                  <ToggleSwitch
                    name="run"
                    checked={data.run}
                    onChange={updateFormValue}
                    disabled={data.automatic && (fault() || !(data.water_level > data.start_p && data.water_level < data.stop_p))}
                  />
                }>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: avtarStatusHighlight(false, theme) }}>
                    {data.run ? <PowerIcon /> : <PowerOffIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Pump" secondary={data.run ? `Running | ${secondsToString(data.running_since)}` : "Ideal"} />
              </ListItem>
              <Divider variant="fullWidth" component="li" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div>
                  <ListItemButton onClick={changeAutoMode}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {data.automatic ? <PersonOffIcon /> : <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Control" secondary={data.automatic ? "Auto" : "Manual"} />
                  </ListItemButton>
                  <Divider variant="fullWidth" component="li" />
                </div>
                <div>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: avtarStatusHighlight(!data.ground_reserve, theme) }}>
                        <WaterIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Ground" secondary={data.ground_reserve ? "Good" : "Empty"} />
                  </ListItem>
                  <Divider variant="fullWidth" component="li" />
                </div>

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
                    <ListItemText primary="Relay" secondary={data.fault_relay ? "Faulty" : "Working"} />
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
                  <Power value={data.run ? data.speed : 0} />
                </div>
                <Typography color="textprimary" align='center' sx={{ marginTop: 2 }}>
                  {data.run ? data.speed : 0} l/m
                </Typography></>}
          </CardContent>
        </Card>
      </div>
    </SectionContent >
  );
};

export default TankStatus;
