import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import './styles/global.css';
import { UserDataProvider } from './contexts/UserDataContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserDataProvider>
        <App />
      </UserDataProvider>
    </BrowserRouter>
  </StrictMode>,
);
