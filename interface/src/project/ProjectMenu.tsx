import { FC } from 'react';

import { List } from '@mui/material';

import { PROJECT_PATH } from '../api/env';
import LayoutMenuItem from '../components/layout/LayoutMenuItem';
import WaterOutlinedIcon from '@mui/icons-material/WaterOutlined';

const ProjectMenu: FC = () => (
  <List>
    <LayoutMenuItem icon={WaterOutlinedIcon} label="Water Tank" to={`/${PROJECT_PATH}/demo`} />
  </List>
);

export default ProjectMenu;
