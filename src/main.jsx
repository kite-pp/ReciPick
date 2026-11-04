import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import './styles/global.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { UserDataProvider } from './contexts/UserDataContext.jsx';

// UserDataProvider가 로그인한 계정별로 데이터를 나누므로 AuthProvider 안쪽에 둡니다.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserDataProvider>
          <App />
        </UserDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
