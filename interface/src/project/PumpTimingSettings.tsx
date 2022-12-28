import { FC, useEffect, useState } from 'react';
import { FormLoader, SectionContent, ValidatedTextField } from '../components';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button/Button';
import Card from '@mui/material/Card/Card';
import Fab from '@mui/material/Fab/Fab';
import AddIcon from '@mui/icons-material/Add';
import styled from '@emotion/styled';
import SaveIcon from '@mui/icons-material/Save';
import { Dialog, DialogActions, IconButton, Slider, Stack, Switch, TextField, ToggleButton, useTheme } from '@mui/material';
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
var flag = true;
const PumpTimingSettings: FC = () => {
  // const [timer, setTimer] = React.useState<PumpTimingSetting[]>([]);
  const [timepopup, setTimepopup] = useState<boolean>(false);

  const {
    loadData, saving, data, setData, saveData, errorMessage
  } = useRest<AutoStartTiming[]>({ read: PumpApi.readAutoStartTiming, update: PumpApi.updateAutoStartTiming });
  // const [data, setData] = useState<AutoStartTiming[]>([{ hour: 1, minute: 5, weekAndState: 12 }]);
  // setData([{hour:1, minute:5, weekAndState:12}]);

  if (!data) {
    console.log(data);
    return (<FormLoader />);
  }

  if (data && data.constructor !== Array) {
    setData([]);
  }

  const openTimerPopUp = (index: number) => {
    idx = index;
    if (idx == ADD_NEW_TIMER && data.length >= MAX_AUTOSTART) {
      return;
    }
    setTimepopup(true);
  };

  const closeTimerSetBox = () => {
    setTimepopup(false);
  };

  const saveTimer = (value: SetTime) => {
    if (idx < data.length) {
      let newArr = [...data];
      data[idx].hour = value.hour;
      data[idx].minute = value.minute;
      setData(newArr);
    } else {
      let newArr = [...data];
      newArr.push({ hour: value.hour, minute: value.minute, weekAndState: 0 });
      setData(newArr);
    };
    setTimepopup(false);
  };

  const TimePopUp: FC = () => {
    const [value, setValue] = React.useState<Dayjs>(dayjs().hour(data[idx]?.hour ?? 0).minute(data[idx]?.minute ?? 0));

    return (
      <>
        <Dialog
          open={timepopup}
          onClose={closeTimerSetBox}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticTimePicker
              ampm
              orientation="landscape"
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

  const toggleBit = (i: number, bitIdx: number) => {
    console.log(data[i].weekAndState);
    let newArr = [...data];
    newArr[i].weekAndState ^= 1 << bitIdx;
    setData(newArr);
  };

  const TimerCard: FC<index> = ({ i }) => {
    return (
      <Card variant="outlined" sx={{ borderRadius: 5, margin: 2, display: 'inline-block', width: 330 }} >
        <CardContent>
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Stack direction="row" alignItems={'baseline'} spacing={1}>
              <Typography variant="h3" component="div">
                {`${('0' + ((data[i].hour % 12) || 12)).slice(-2)}:${('0' + (data[i].minute)).slice(-2)}`}
              </Typography>
              <Typography color="text.secondary">
                {data[i].hour >= 12 ? 'p.m' : 'a.m'}
              </Typography>
            </Stack>
            <Stack direction="column" alignItems="end" spacing={0} >
              <ToggleSwitch
                checked={(data[i].weekAndState & (1 << 7)) != 0}
                onChange={() => toggleBit(i, 7)}
              />
              <Stack direction="row" alignItems={'baseline'} spacing={1}>
                <IconButton size="small" aria-label="Edit" onClick={() => { openTimerPopUp(i); }}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Edit" onClick={() => {
                  let newArr = [...data];
                  newArr.splice(i, 1);
                  setData(newArr);
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
                selected={(data[i].weekAndState & (1 << bit)) != 0}
              >{val}</ToggleButton>
             })}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const validateAndSave = async () => {
    console.log("Sending...");

    // const timingData: AutoStartTimingList = { timing: [] };
    // timer.forEach((item, i) => {
    //   console.log(item.sunday);
    //   var weekToDidigit = (item.status ? 128 : 0) + (item.sunday ? 64 : 0) + (item.monday ? 32 : 0) + (item.tuesday ? 16 : 0) + (item.wednesday ? 8 : 0) + (item.thursday ? 4 : 0) + (item.friday ? 2 : 0) + (item.saturday ? 1 : 0);
    //   timingData.push({ hour: item.hour, minute: item.minute, weekAndState: weekToDidigit });
    //   console.log(weekToDidigit);

    // });
    // setData(timingData);
    // await saveData();
  };
  return (
    <>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {data && data.constructor === Array && data.map((obj, i) =>
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
        <Fab sx={{ margin: 1.5 }} size="small" color="primary" aria-label="add" disabled={data.length >= MAX_AUTOSTART}
          onClick={() => openTimerPopUp(100)}>
          <AddIcon />
        </Fab>
      </div>
      <TimePopUp />
    </>
  );

};

export default PumpTimingSettings;