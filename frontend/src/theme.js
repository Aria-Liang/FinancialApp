// src/theme.js
import { createTheme } from '@mui/material/styles';

// 创建 Material UI 的自定义主题，使用深绿色、亮绿色、黑色作为主色调
const theme = createTheme({
  palette: {
    primary: {
      main: '#1B5E20',  // 深绿色
    },
    secondary: {
      main: '#2e7d32',  // 亮绿色
    },
    light: {
      main:'#86BF99',
    },
    background: {
      default: '#FFFFFF',  // 白色背景
      paper: '#F4F4F4',    // 浅灰色用于组件的背景
    },
    text: {
      primary: '#000000',  // 黑色字体
      secondary: '#757575', // 浅灰色字体用于次要信息
    },
  },
  typography: {
    fontFamily: 'Fredoka, sans-serif',  // 自定义字体
  },
});

export default theme;
