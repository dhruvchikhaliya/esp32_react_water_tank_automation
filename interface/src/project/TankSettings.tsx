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
import { Dialog, DialogActions, IconButton, Stack, Switch, TextField, ToggleButton, useTheme } from '@mui/material';
import { index, PumpSetting, SetTime } from '../types/pumpsettings';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { relative } from 'path';

const MAX_AUTOSTART = 5;
const ADD_NEW_TIMER = 100;
var idx = ADD_NEW_TIMER;
var deafultTime: PumpSetting = { hour: 0, minute: 0, sunday: false, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, status: false };


interface TimePopUpProps {
  open: boolean;
  selectedValue: SetTime;
  onSave: (value: SetTime) => void;
  onClose: () => void;
}

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
  const [swstatus, setSwstatus] = React.useState<PumpSetting[]>([]);
  const [timepopup, setTimepopup] = useState<boolean>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const openTimerPopUp = (index: number) => {
    idx = index;
    if (index == ADD_NEW_TIMER && swstatus.length >= MAX_AUTOSTART) {
      return;
    }
    setTimepopup(true);
  };

  const closeTimerSetBox = () => {
    setTimepopup(false);
  };

  const saveTimer = (value: SetTime) => {
    if (idx < swstatus.length) {
      let newArr = [...swstatus];
      newArr[idx].hour = value.hour;
      newArr[idx].minute = value.minute;
      setSwstatus(newArr);
    } else {
      setSwstatus(swstatus => [...swstatus, { hour: value.hour, minute: value.minute, sunday: false, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, status: false }]);
    }
    setTimepopup(false);
  };

  const TimePopUp: FC = () => {
    const [value, setValue] = React.useState<Dayjs>(dayjs().hour(idx == ADD_NEW_TIMER ? 0 : swstatus[idx].hour).minute(idx == ADD_NEW_TIMER ? 0 : swstatus[idx].minute));

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
      <Card variant="outlined" sx={{ borderRadius: 5, margin: 2, display: 'inline-block' }} >
        <CardContent>
          <div className='w-full text-right flex flex-row'>
            <Stack direction="row" alignItems={'baseline'} spacing={1}>
              <Typography variant="h3" component="div">
                {`${('0' + ((swstatus[i].hour % 12) || 12)).slice(-2)}:${('0' + (swstatus[i].minute)).slice(-2)}`}
              </Typography>
              <Typography color="text.secondary">
                {swstatus[i].hour >= 12 ? 'p.m' : 'a.m'}
              </Typography>
            </Stack>

            <Stack direction="column" alignItems="end" spacing={0} sx={{ ml: 9 }}>
              <ToggleSwitch
                sx={{ right: 0 }}
                checked={swstatus[i]?.status}
                onChange={() => {
                  let newArr = [...swstatus];
                  newArr[i].status = !newArr[i].status;
                  setSwstatus(newArr);
                }}
              />
              <Stack direction="row" alignItems={'baseline'} spacing={1}>
                <IconButton size="small" aria-label="Edit" onClick={() => { openTimerPopUp(i); }}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Edit" onClick={() => {
                  let newArr = [...swstatus];
                  newArr.splice(i, 1);
                  setSwstatus(newArr);
                }}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>
          </div>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...swstatus];
                newArr[i].sunday = !newArr[i].sunday;
                setSwstatus(newArr);
              }}
              selected={swstatus[i]?.sunday}
            >S</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...swstatus];
                newArr[i].monday = !newArr[i].monday;
                setSwstatus(newArr);
              }}
              selected={swstatus[i]?.monday}
            >M</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...swstatus];
                newArr[i].tuesday = !newArr[i].tuesday;
                setSwstatus(newArr);
              }}
              selected={swstatus[i]?.tuesday}
            >T</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...swstatus];
                newArr[i].wednesday = !newArr[i].wednesday;
                setSwstatus(newArr);
              }}
              selected={swstatus[i]?.wednesday}
            >W</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...swstatus];
                newArr[i].thursday = !newArr[i].thursday;
                setSwstatus(newArr);
              }}
              selected={swstatus[i]?.thursday}
            >T</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...swstatus];
                newArr[i].friday = !newArr[i].friday;
                setSwstatus(newArr);
              }}
              selected={swstatus[i]?.friday}
            >F</ToggleButton>
            <ToggleButton
              color="primary"
              value="check"
              onChange={() => {
                let newArr = [...swstatus];
                newArr[i].saturday = !newArr[i].saturday;
                setSwstatus(newArr);
              }}
              selected={swstatus[i]?.saturday}
            >S</ToggleButton>
          </Stack>
        </CardContent>
      </Card>
    );
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

          {swstatus.map((obj, i) =>
            (<TimerCard i={i} />)
          )}

          <div className='w-full text-right'>
            <Button
              startIcon={<SaveIcon />}
              // disabled={saving || noAdminConfigured()}
              variant="contained"
              color="primary"
              type="submit"
            // onClick={()=>setTimepopup(true)}
            >Save</Button>
            <Fab sx={{ margin: 1.5 }} size="small" color="primary" aria-label="add" disabled={swstatus.length >= MAX_AUTOSTART}
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
      </SectionContent>
      <TimePopUp />
    </>
  );
};

export default TankSettings;