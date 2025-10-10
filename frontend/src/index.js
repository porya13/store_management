import React from 'react';
import ReactDOM from 'react-dom/client';
import './output.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/home'
import ProtectedRoute from './components/ProtectedRoute'
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>

       <App/>
    </AuthProvider>
  </React.StrictMode>,
);

