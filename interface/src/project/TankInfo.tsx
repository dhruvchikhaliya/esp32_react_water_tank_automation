
import React, { FC, useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Tab } from '@mui/material';

import { RouterTabs, useRouterTab, useLayoutTitle } from '../components';

import TankStatus from './TankStatus';
import TankSettings from './TankSettings';
import { AuthenticatedContext } from '../contexts/authentication';

const TankInfo: FC = () => {
  useLayoutTitle("Water Tank");
  const { routerTab } = useRouterTab();
  const authenticatedContext = useContext(AuthenticatedContext);

  return (
    <>
      <RouterTabs value={routerTab}>
        <Tab value="status" label="status" />
        <Tab value="settings" label="settings" />
      </RouterTabs>
      <Routes>
        <Route path="status" element={<TankStatus />} />
        <Route path="settings" element={<TankSettings />} />
        <Route path="/*" element={<Navigate replace to="status" />} />
      </Routes>
    </>
  );
};

export default TankInfo;
