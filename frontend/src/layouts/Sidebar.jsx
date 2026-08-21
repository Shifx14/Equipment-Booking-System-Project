import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Package, 
  ClipboardList, 
  Archive, 
  LifeBuoy, 
  Settings, 
  LogOut,
  Calendar,
  Users,
  Wrench
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const userRoutes = [
    { name: 'Equipment', path: '/', icon: <Package size={20} /> },
    { name: 'Requests', path: '/requests', icon: <ClipboardList size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Archive size={20} /> },
    { name: 'Support', path: '/support', icon: <LifeBuoy size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const adminRoutes = [
    { name: 'Bookings', path: '/admin/bookings', icon: <Calendar size={20} /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <Package size={20} /> },
    { name: 'Rentals', path: '/admin/rentals', icon: <Wrench size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Tickets', path: '/admin/tickets', icon: <LifeBuoy size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const routes = user?.role === 'admin' ? adminRoutes : userRoutes;

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight">Gear Booking</h2>
        <p className="text-sm text-gray-400 mt-1 capitalize">{user?.role} Portal</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {routes.map((route) => (
          <NavLink
            key={route.name}
            to={route.path}
            end={route.path === '/' || route.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {route.icon}
            <span className="font-medium">{route.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;