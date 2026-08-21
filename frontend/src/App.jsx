import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Auth/Login';

// Admin Pages
import AdminInventory from './pages/Admin/Inventory';
import AdminBookings from './pages/Admin/Bookings';
import AdminRentals from './pages/Admin/Rentals';
import AdminTickets from './pages/Admin/Tickets';

// User Pages
import EquipmentCatalog from './pages/User/EquipmentCatalog';
import UserRequests from './pages/User/Requests';
import UserInventory from './pages/User/Inventory';
import UserSupport from './pages/User/Support';

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
            <Route path="/" element={<EquipmentCatalog />} />
            <Route path="/requests" element={<UserRequests />} />
            <Route path="/inventory" element={<UserInventory />} />
            <Route path="/support" element={<UserSupport />} />
            <Route path="/settings" element={<Placeholder title="User Settings" />} />
          </Route>

          <Route element={<ProtectedRoute requireAdmin={true}><MainLayout /></ProtectedRoute>}>
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/rentals" element={<AdminRentals />} />
            <Route path="/admin/users" element={<Placeholder title="User Management" />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/settings" element={<Placeholder title="Admin Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;