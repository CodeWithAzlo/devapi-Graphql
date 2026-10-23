// ============================================================
// main.jsx
// React entry: wrap the app with Apollo + React Router.
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { apolloClient } from './apollo/client.js';
import { AuthProvider } from './auth/AuthContext.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
