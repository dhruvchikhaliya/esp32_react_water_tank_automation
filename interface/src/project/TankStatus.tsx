import { FC } from 'react';
import React from 'react';
import { Typography, Box, List, ListItem, ListItemText, Card, CardContent, duration, Grid, LinearProgress } from '@mui/material';

import { SectionContent } from '../components';
import { title } from 'process';
import { styled } from '@mui/material/styles';
import { linearProgressClasses } from '@mui/material/LinearProgress';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  width: 300,
  height: 10, 
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
  },
}));

const TankStatus: FC = () => (
  <SectionContent title='Demo Information' titleGutter>
    <Card variant="outlined" sx={{ borderRadius: 5, margin: 2, display: 'inline-block' }} >
      <CardContent >
        <Typography color="textSecondary" gutterBottom variant="body2">
          STATUS
        </Typography>
      <BorderLinearProgress variant="determinate" value={50} />
      </CardContent>
    </Card>
  </SectionContent>
);

export default TankStatus;
