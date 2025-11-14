import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Se eliminaron imports de demos para mantener mínima la estructura.

// Métricas de rendimiento (CRA) deshabilitadas para simplificar.
// Si deseas habilitarlas, reintroduce reportWebVitals y su llamada.
