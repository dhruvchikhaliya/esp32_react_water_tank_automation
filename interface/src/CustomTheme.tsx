import { FC, useState } from 'react';

import { CssBaseline } from '@mui/material';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import { indigo, blueGrey, orange, red, green, grey, lightBlue } from '@mui/material/colors';

import { RequiredChildrenProps } from './utils';
import { changeModeContext } from './components';

const lightTheme = responsiveFontSizes(
  createTheme({
    palette: {
      background: {
        default: "#fafafa"
      },
      primary: lightBlue,
      secondary: blueGrey,
      info: {
        main: lightBlue[500]
      },
      warning: {
        main: orange[500]
      },
      error: {
        main: red[500]
      },
      success: {
        main: green[500]
      }
    }
  })
);
const darkTheme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "dark",
      text: {
        primary: '#fff',
        secondary: grey[500],
      },
      primary: {
        main: lightBlue[500]
      },
      secondary: {
        main: blueGrey[800]
      },
      info: {
        main: indigo[800]
      },
      warning: {
        main: orange[800]
      },
      error: {
        main: red[800]
      },
      success: {
        main: green[800]
      }
    }
  })
);

const CustomTheme: FC<RequiredChildrenProps> = ({ children }) => {
  const [theme, setTheme] = useState(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light');

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    setTheme(event.matches ? "Dark" : "Light");
  });

  return (
    <changeModeContext.Provider value={[theme, setTheme]}>
      <ThemeProvider theme={theme === 'Dark' ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </changeModeContext.Provider>
  );
};
export default CustomTheme;
