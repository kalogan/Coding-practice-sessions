import React from 'react';
import { createRoot } from 'react-dom/client';
import { Playground } from './Playground';
import '../styles.css';
import './playground.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Playground />
  </React.StrictMode>,
);
