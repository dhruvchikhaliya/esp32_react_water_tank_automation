import { Accordion, AccordionSummary, Typography } from '@mui/material';
import { FC } from 'react';
import { SectionContent } from '../components';
import PumpTimingSettings from './PumpTimingSettings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';
import StartStopPointSettings from './StartStopPointSettings';
import LedColorSetting from './LedColorSetting';


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
          <LedColorSetting />
        </Accordion>

        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            <Typography>Start and stop points</Typography>

          </AccordionSummary>
          <StartStopPointSettings />
        </Accordion>
      </SectionContent>
    </>
  );
};

export default TankSettings;