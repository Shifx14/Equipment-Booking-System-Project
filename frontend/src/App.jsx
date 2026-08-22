import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Auth/Login';

// Shared Pages
import Settings from './pages/Shared/Settings';

// Admin Pages
import AdminInventory from './pages/Admin/Inventory';
import AdminBookings from './pages/Admin/Bookings';
import AdminRentals from './pages/Admin/Rentals';
import AdminTickets from './pages/Admin/Tickets';
import AdminUsers from './pages/Admin/Users';

// User Pages
import EquipmentCatalog from './pages/User/EquipmentCatalog';
import UserRequests from './pages/User/Requests';
import UserInventory from './pages/User/Inventory';
import UserSupport from './pages/User/Support';

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
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route element={<ProtectedRoute requireAdmin={true}><MainLayout /></ProtectedRoute>}>
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/rentals" element={<AdminRentals />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;