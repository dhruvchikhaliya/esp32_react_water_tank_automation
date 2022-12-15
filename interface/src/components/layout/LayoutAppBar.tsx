
import { FC, useContext } from 'react';

import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { FeaturesContext } from '../../contexts/features';

import LayoutAuthMenu from './LayoutAuthMenu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { changeModeContext } from './context';

export const DRAWER_WIDTH = 280;

interface LayoutAppBarProps {
  title: string;
  onToggleDrawer: () => void;
}

const LayoutAppBar: FC<LayoutAppBarProps> = ({ title, onToggleDrawer }) => {
  const { features } = useContext(FeaturesContext);
  const [theme, setTheme] = useContext(changeModeContext);

  const toggleTheme = () => {
    setTheme(theme === 'Light' ? 'Dark' : 'Light');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        boxShadow: 'none'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onToggleDrawer}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          {title}
        </Typography>
        <Box flexGrow={1} />

        {theme} mode
        <IconButton sx={{ mr: 1 }} onClick={toggleTheme} color="inherit">
          {theme === 'Dark' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>

        {features.security && <LayoutAuthMenu />}
      </Toolbar>
    </AppBar>
  );
};

export default LayoutAppBar;
