import { FC, useState } from 'react';
import { SectionContent, ValidatedTextField } from '../components';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import Accordion from '@mui/material/Accordion/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import { AutoStartTiming, AutoStartTimingList, index, PumpTimingSetting, SetTime } from '../types';
import { useRest } from '../utils';
import * as PumpApi from "../api/pump";

const MAX_AUTOSTART = 5;
const ADD_NEW_TIMER = 100;
var idx = ADD_NEW_TIMER;
var deafultTime: PumpTimingSetting = { hour: 0, minute: 0, sunday: false, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, status: false };


interface TimePopUpProps {
  open: boolean;
  selectedValue: SetTime;
  onSave: (value: SetTime) => void;
  onClose: () => void;
}

function valuetext(value: number) {
  return `${value}°C`;
}
const marks = Array.from({ length: 11 }, (_, i) => ({
  value: (i * 10),
  label: `${i * 200}L`,
}));

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

const TankSettings: FC = () => {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [timer, setTimer] = React.useState<PumpTimingSetting[]>([]);
  const [timepopup, setTimepopup] = useState<boolean>(false);
  const {
    loadData, saving, data, setData, saveData, errorMessage
  } = useRest<AutoStartTimingList>({ read: PumpApi.readAutoStartTiming, update: PumpApi.updateAutoStartTiming });

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const openTimerPopUp = (index: number) => {
    idx = index;
    if (index == ADD_NEW_TIMER && timer.length >= MAX_AUTOSTART) {
      return;
    }
    setTimepopup(true);
  };

  const closeTimerSetBox = () => {
    setTimepopup(false);
  };

  const saveTimer = (value: SetTime) => {
    if (idx < timer.length) {
      let newArr = [...timer];
      newArr[idx].hour = value.hour;
      newArr[idx].minute = value.minute;
      setTimer(newArr);
    } else {
      setTimer(timer => [...timer, { hour: value.hour, minute: value.minute, sunday: false, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, status: false }]);
    }
    setTimepopup(false);
  };

  const TimePopUp: FC = () => {
    const [value, setValue] = React.useState<Dayjs>(dayjs().hour(timer[idx]?.hour ?? 0).minute(timer[idx]?.minute ?? 0));

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

  const TimerCard: FC<index> = ({ i }) => {
    return (
      <Card variant="outlined" sx={{ borderRadius: 5, margin: 2, display: 'inline-block', width: 330 }} >
        <CardContent>
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Stack direction="row" alignItems={'baseline'} spacing={1}>
              <Typography variant="h3" component="div">
                {`${('0' + ((timer[i].hour % 12) || 12)).slice(-2)}:${('0' + (timer[i].minute)).slice(-2)}`}
              </Typography>
              <Typography color="text.secondary">
                {timer[i].hour >= 12 ? 'p.m' : 'a.m'}
              </Typography>
            </Stack>
            <Stack direction="column" alignItems="end" spacing={0} >
              <ToggleSwitch
                checked={timer[i]?.status}
                onChange={() => {
                  let newArr = [...timer];
                  newArr[i].status = !newArr[i].status;
                  setTimer(newArr);
                }}
              />
              <Stack direction="row" alignItems={'baseline'} spacing={1}>
                <IconButton size="small" aria-label="Edit" onClick={() => { openTimerPopUp(i); }}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Edit" onClick={() => {
                  let newArr = [...timer];
                  newArr.splice(i, 1);
                  setTimer(newArr);
                }}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }} justifyContent="center">
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...timer];
                newArr[i].sunday = !newArr[i].sunday;
                setTimer(newArr);
              }}
              selected={timer[i]?.sunday}
            >S</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...timer];
                newArr[i].monday = !newArr[i].monday;
                setTimer(newArr);
              }}
              selected={timer[i]?.monday}
            >M</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...timer];
                newArr[i].tuesday = !newArr[i].tuesday;
                setTimer(newArr);
              }}
              selected={timer[i]?.tuesday}
            >T</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...timer];
                newArr[i].wednesday = !newArr[i].wednesday;
                setTimer(newArr);
              }}
              selected={timer[i]?.wednesday}
            >W</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...timer];
                newArr[i].thursday = !newArr[i].thursday;
                setTimer(newArr);
              }}
              selected={timer[i]?.thursday}
            >T</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...timer];
                newArr[i].friday = !newArr[i].friday;
                setTimer(newArr);
              }}
              selected={timer[i]?.friday}
            >F</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...timer];
                newArr[i].saturday = !newArr[i].saturday;
                setTimer(newArr);
              }}
              selected={timer[i]?.saturday}
            >S</ToggleButton>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const validateAndSave = async () => {
    console.log("Sending...");

    const timingData: AutoStartTimingList = { timing: [] };
    timer.forEach((item, i) => {
      console.log(item.sunday);
      var weekToDidigit = (item.status ? 128 : 0) + (item.sunday ? 64 : 0) + (item.monday ? 32 : 0) + (item.tuesday ? 16 : 0) + (item.wednesday ? 8 : 0) + (item.thursday ? 4 : 0) + (item.friday ? 2 : 0) + (item.saturday ? 1 : 0);
      timingData.timing.push({ hour: item.hour, minute: item.minute, weekAndState: weekToDidigit });
      console.log(weekToDidigit);
      
    });
    setData(timingData);
    await saveData();
  };
  return (
    <>
      <SectionContent title='Setting' titleGutter>
        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography>Auto start scheduling</Typography>
          </AccordionSummary>

          <div className="grid grid-cols-1 md:grid-cols-3">
            {timer.map((obj, i) =>
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
            <Fab sx={{ margin: 1.5 }} size="small" color="primary" aria-label="add" disabled={timer.length >= MAX_AUTOSTART}
              onClick={() => openTimerPopUp(100)}>
              <AddIcon />
            </Fab>
          </div>

        </Accordion>

        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            <Typography>LED color settings</Typography>
          </AccordionSummary>
          <div className='w-full text-right'>
            <Fab sx={{ margin: 1.5 }} size="small" color="primary" aria-label="add" >
              <AddIcon />
            </Fab>
          </div>
        </Accordion>

        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            <Typography>Start and stop points</Typography>

          </AccordionSummary>
          <div className='flex justify-center'>
            <Slider
              sx={{ height: 500, width: 200 }}
              getAriaLabel={() => 'StopStartSetting'}
              getAriaValueText={valuetext}
              defaultValue={[20, 60]}
              valueLabelDisplay="off"
              marks={marks}
              step={null}
              orientation="vertical"
            />
          </div>
          <div className='w-full text-right'>
            <Button sx={{ margin: 1.5 }}
              startIcon={<SaveIcon />}
              // disabled={saving || noAdminConfigured()}
              variant="contained"
              color="primary"
              type="submit"
            // onClick={()=>setTimepopup(true)}
            >Save</Button>
          </div>
        </Accordion>


      </SectionContent>
      <TimePopUp />
    </>
  );
};

export default TankSettings;