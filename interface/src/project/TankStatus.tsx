import { FC, useState } from 'react';
import React from 'react';
import { Typography, Box, List, ListItem, ListItemText, Card, CardContent, duration, Grid, LinearProgress, Stack } from '@mui/material';

import { SectionContent } from '../components';
import { Arced } from '../gauge/arced';
import { Power } from '../gauge/power';


const TankStatus: FC = () => {
  const [water, setWater] = useState(30);
  const [waterSpeed, setWaterSpeed] = useState(30);
  return (
    <SectionContent title='Information' titleGutter>
      <div className="grid grid-cols-1 md:grid-cols-3">
        <Card variant="outlined" sx={{ borderRadius: 5, margin: 2 }} >
          <CardContent >
            <Typography color="textSecondary" variant="body2" >
              STATUS
            </Typography>
            <div className="mt-8">
              <Arced
                value={water} />
            </div>
            <Typography color="textprimary" align='center' sx={{ marginTop: 2 }}>
              {water} Liters
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 5, margin: 2, display: 'inline-block' }} >
          <CardContent >
            <Typography color="textSecondary" variant="body2">
              SPEED
            </Typography>
            <div className="mt-4">
              <Power value={waterSpeed} />
            </div>
            <Typography color="textprimary" align='center' sx={{ marginTop: 2 }}>
              {waterSpeed} l/m
            </Typography>
          </CardContent>
        </Card>
      </div>
    </SectionContent>
  );
};

export default TankStatus;
