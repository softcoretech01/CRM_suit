import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/theme.css';
import './styles/layout.css';
import App from './App';
import { CrmProvider } from './context/CrmContext';
import { ToastProvider } from './context/ToastContext';
import { PortalProvider } from './context/PortalContext';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PortalProvider>
        <ToastProvider>
          <CrmProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </CrmProvider>
        </ToastProvider>
      </PortalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
