
import React, { FC, useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Tab } from '@mui/material';

import { RouterTabs, useRouterTab, useLayoutTitle } from '../components';

import TankStatus from './TankStatus';
import TankSettings from './TankSettings';
import { AuthenticatedContext } from '../contexts/authentication';

const DemoProject: FC = () => {
  useLayoutTitle("Water Tank");
  const { routerTab } = useRouterTab(); 
  const authenticatedContext = useContext(AuthenticatedContext);

  return (
    <>
      <RouterTabs value={routerTab}>
        <Tab value="status" label="Status" />
        <Tab value="settings" label="Settings"  disabled={!authenticatedContext.me.admin}/>
      </RouterTabs>
      <Routes>
        <Route path="status" element={<TankStatus />} />
        <Route path="Settings" element={<TankSettings />} />
        <Route path="/*" element={<Navigate replace to="status" />} />
      </Routes>
    </>
  );
};

export default DemoProject;
