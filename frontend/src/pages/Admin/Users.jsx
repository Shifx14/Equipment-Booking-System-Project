import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, ShieldAlert, KeyRound, Ban, User } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [resetModal, setResetModal] = useState({ show: false, user: null, new_password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBan = async (id) => {
    if (!confirm('Are you sure you want to toggle the ban status for this user?')) return;
    try {
      await axios.patch(`http://localhost:8000/api/admin/users/${id}/ban`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.detail || 'Error updating ban status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModal.new_password) return;
    try {
      await axios.post(`http://localhost:8000/api/admin/users/${resetModal.user.id}/reset-password`, {
        new_password: resetModal.new_password
      });
      alert(`Password successfully reset for ${resetModal.user.username}`);
      setResetModal({ show: false, user: null, new_password: '' });
    } catch (e) {
      alert(e.response?.data?.detail || 'Error resetting password');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm">View user directory, manage bans, and reset passwords.</p>
        </div>
        <div className="w-72">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full border rounded-lg p-2 focus:border-blue-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm">
              <th className="p-4">User Details</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email} • @{u.username}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded font-semibold capitalize ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  {u.is_banned ? (
                    <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                      <Ban size={14} /> Banned
                    </span>
                  ) : (
                    <span className="text-green-600 text-sm font-medium">Active</span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setResetModal({ show: true, user: u, new_password: '' })}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Reset Password"
                    >
                      <KeyRound size={18} />
                    </button>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleBan(u.id)}
                        className={`p-2 rounded transition-colors ${
                          u.is_banned 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={u.is_banned ? "Unban User" : "Ban User"}
                      >
                        {u.is_banned ? <Shield size={18} /> : <ShieldAlert size={18} />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {resetModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleResetPassword} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Reset Password</h2>
            <p className="text-gray-500 text-sm mb-4">Directly set a new password for <strong>{resetModal.user?.name}</strong>.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                required
                className="w-full border rounded p-2"
                value={resetModal.new_password}
                onChange={(e) => setResetModal({...resetModal, new_password: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetModal({ show: false, user: null, new_password: '' })}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Force Reset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Users;