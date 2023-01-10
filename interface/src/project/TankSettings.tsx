import { Accordion, AccordionSummary, Typography, Fab, Slider, Button } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { FormLoader, SectionContent, ValidatedTextField } from '../components';
import PumpTimingSettings from './PumpTimingSettings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { TankStartStopPoints } from '../types';
import { useRest } from '../utils';
import * as PumpApi from "../api/pump";
import StartStopPointSettings from './StartStopPointSettings';


const TankSettings: FC = () => {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };


  return (
    <>
      <SectionContent title='Setting' titleGutter><Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography>Auto start scheduling</Typography>
        </AccordionSummary>
        <PumpTimingSettings />
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
          <StartStopPointSettings/>
        </Accordion>
      </SectionContent>
    </>
  );
};

export default TankSettings;