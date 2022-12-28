import { Accordion, AccordionSummary, Typography, Fab, Slider, Button } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { FormLoader, SectionContent, ValidatedTextField } from '../components';
import PumpTimingSettings from './PumpTimingSettings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import React from 'react';

function valuetext(value: number) {
  return `${value}°C`;
}

const marks = Array.from({ length: 11 }, (_, i) => ({
  value: (i * 10),
  label: `${i * 200}L`,
}));

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
    </>
  );
};

export default TankSettings;