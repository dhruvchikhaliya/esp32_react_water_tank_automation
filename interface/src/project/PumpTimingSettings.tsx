import { FC, useState } from 'react';
import { FormLoader } from '../components';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import { Typography, CardContent, Button, Card, Fab, Dialog, DialogActions, IconButton, Stack, Switch, TextField, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import styled from '@emotion/styled';
import SaveIcon from '@mui/icons-material/Save';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AutoStartTiming, index, SetTime } from '../types';
import { useRest } from '../utils';
import * as PumpApi from "../api/pump";

const MAX_AUTOSTART = 5;
const ADD_NEW_TIMER = 100;
var idx = ADD_NEW_TIMER;

const ToggleSwitch = styled(Switch)(() => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&:before, &:after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));

const PumpTimingSettings: FC = () => {
  const isMobile = useMediaQuery('(min-width:600px)');
  const [timepopup, setTimepopup] = useState<boolean>(false);
  const {
    loadData, saving, data, setData, saveData, errorMessage
  } = useRest<AutoStartTiming>({ read: PumpApi.readAutoStartTiming, update: PumpApi.updateAutoStartTiming });

  if (!data) {
    return (<FormLoader />);
  }

  if (data && !data?.hasOwnProperty('timing')) {
    setData({ timing: [] });
  }

  const closeTimerSetBox = () => {
    setTimepopup(false);
  };

  const saveTimer = (value: SetTime) => {
    if (idx < data.timing.length) {
      let newArr = [...data.timing];
      newArr[idx].hour = value.hour;
      newArr[idx].minute = value.minute;
      setData({ timing: newArr });
    } else {
      let newArr = [...data.timing];
      newArr.push({ hour: value.hour, minute: value.minute, weekAndState: 0 });
      setData({ timing: newArr });
    };
    setTimepopup(false);
  };
  const TimePopUp: FC = () => {
    const [value, setValue] = React.useState<Dayjs>(dayjs().hour(idx == ADD_NEW_TIMER ? 0 : data.timing[idx]?.hour).minute(idx == ADD_NEW_TIMER ? 0 : data.timing[idx]?.minute));

    return (
      <>
        <Dialog
          open={timepopup}
          onClose={closeTimerSetBox}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticTimePicker
              orientation={isMobile ? "landscape" : "portrait"}
              ampm
              openTo="hours"
              value={value}
              onChange={(newValue) => {
                if (newValue != null) {
                  setValue(newValue);
                }
              }}
              toolbarTitle="Select time"
              renderInput={(par) => <TextField {...par} />}
              components={{
                ActionBar: () => {
                  return (
                    <DialogActions>
                      <Button startIcon={<CloseIcon />} variant="contained" color="primary" onClick={closeTimerSetBox}>Close</Button>
                      <Button startIcon={<SaveIcon />} variant="contained" color="primary" onClick={() => saveTimer({ hour: value.hour(), minute: value.minute() })}>Save</Button>
                    </DialogActions>
                  );
                }
              }}
            />
          </LocalizationProvider>
        </Dialog>
      </>
    );
  };

  const openTimerPopUp = (index: number) => {
    idx = index;
    if (idx == ADD_NEW_TIMER && data.timing.length >= MAX_AUTOSTART) {
      return;
    }
    setTimepopup(true);
  };

  const toggleBit = (i: number, bitIdx: number) => {
    let newArr = [...data.timing];
    newArr[i].weekAndState ^= 1 << bitIdx;
    setData({ timing: newArr });
  };

  const TimerCard: FC<index> = ({ i }) => {
    return (
      <Card variant="outlined" sx={{ borderRadius: 5, margin: 2, display: 'inline-block', width: 330 }} >
        <CardContent>
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Stack direction="row" alignItems={'baseline'} spacing={1}>
              <Typography variant="h3" component="div">
                {`${('0' + ((data.timing[i].hour % 12) || 12)).slice(-2)}:${('0' + (data.timing[i].minute)).slice(-2)}`}
              </Typography>
              <Typography color="text.secondary">
                {data.timing[i].hour >= 12 ? 'p.m' : 'a.m'}
              </Typography>
            </Stack>
            <Stack direction="column" alignItems="end" spacing={0} >
              <ToggleSwitch
                checked={(data.timing[i].weekAndState & (1 << 7)) != 0}
                onChange={() => toggleBit(i, 7)}
              />
              <Stack direction="row" alignItems={'baseline'} spacing={1}>
                <IconButton size="small" aria-label="Edit" onClick={() => { openTimerPopUp(i); }}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Edit" onClick={() => {
                  let newArr = [...data.timing];
                  newArr.splice(i, 1);
                  setData({ timing: newArr });
                }}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }} justifyContent="center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((val, bit) => {
              return <ToggleButton
                color="primary"
                value="check"
                onChange={() => toggleBit(i, bit)}
                selected={(data.timing[i].weekAndState & (1 << bit)) != 0}
              >{val}</ToggleButton>;
            })}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const validateAndSave = async () => {
    await saveData();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {data.timing && data.timing.constructor === Array && data.timing.map((obj, i) =>
          (<TimerCard i={i} />)
        )}
      </div>
      <div className='w-full text-right'>
        <Button
          startIcon={<SaveIcon />}
          // disabled={saving || noAdminConfigured()}
          variant="contained"
          color="primary"
          type="submit"
          onClick={validateAndSave}
        >Save</Button>
        <Fab sx={{ margin: 1.5 }} size="small" color="primary" aria-label="add" disabled={data?.timing?.length >= MAX_AUTOSTART}
          onClick={() => openTimerPopUp(100)}>
          <AddIcon />
        </Fab>
      </div>
      <TimePopUp />
    </>
  );
};

export default PumpTimingSettings;