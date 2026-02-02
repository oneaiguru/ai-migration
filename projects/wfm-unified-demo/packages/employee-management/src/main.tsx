import React from 'react';
import ReactDOM from 'react-dom/client';
import { Root, setupRU } from './Root';

setupRU();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
