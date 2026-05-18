import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './AppContext';
import FloatingBg from './components/FloatingBg';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <FloatingBg />
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
