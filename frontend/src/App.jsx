import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Auth/Login';

const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-600">Module pending implementation.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            {/* User Routes */}
            <Route path="/" element={<Placeholder title="Equipment Catalog" />} />
            <Route path="/requests" element={<Placeholder title="My Requests" />} />
            <Route path="/inventory" element={<Placeholder title="My Inventory" />} />
            <Route path="/support" element={<Placeholder title="Support Desk" />} />
            <Route path="/settings" element={<Placeholder title="User Settings" />} />
          </Route>

          <Route element={<ProtectedRoute requireAdmin={true}><MainLayout /></ProtectedRoute>}>
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />
            <Route path="/admin/bookings" element={<Placeholder title="Bookings Queue" />} />
            <Route path="/admin/inventory" element={<Placeholder title="Inventory Manager" />} />
            <Route path="/admin/rentals" element={<Placeholder title="Rentals Desk" />} />
            <Route path="/admin/users" element={<Placeholder title="User Management" />} />
            <Route path="/admin/tickets" element={<Placeholder title="Support Tickets" />} />
            <Route path="/admin/settings" element={<Placeholder title="Admin Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;