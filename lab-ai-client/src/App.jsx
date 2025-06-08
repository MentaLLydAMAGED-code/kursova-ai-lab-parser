/* App.jsx */
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Process from './pages/Process';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <div style={{ backgroundColor: '#0f0f1a', minHeight: '100vh', paddingTop: '60px' /* Додаємо відступ */ }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/process" element={<ProtectedRoute><Process /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;