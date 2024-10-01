import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import theme from './theme';

ReactDOM.render(
  <React.StrictMode>
      {/* Provides user context globally */}
      <ThemeProvider theme={theme}>  {/* Provides MUI theme globally */}
        <App />
      </ThemeProvider>

  </React.StrictMode>,
  document.getElementById('root')
);

