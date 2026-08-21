import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div className="p-8 font-sans">Login Page Placeholder</div>} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <div className="p-8 font-sans">Standard User Dashboard Placeholder</div>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <div className="p-8 font-sans">Admin Dashboard Placeholder</div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;