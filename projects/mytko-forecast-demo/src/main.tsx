import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';

dayjs.extend(utc);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={{ token: { colorPrimary: '#13c2c2' } }}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
