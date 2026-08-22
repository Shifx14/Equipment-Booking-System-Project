import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock } from 'lucide-react';

const Settings = () => {
  const [profile, setProfile] = useState({ name: '', username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/users/me');
      setProfile({
        name: res.data.name,
        username: res.data.username,
        email: res.data.email
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:8000/api/users/me', profile);
      alert('Profile updated successfully');
    } catch (e) {
      alert(e.response?.data?.detail || 'Error updating profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("New passwords do not match");
      return;
    }
    try {
      await axios.put('http://localhost:8000/api/users/me/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      alert('Password updated successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (e) {
      alert(e.response?.data?.detail || 'Error updating password');
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile details and security credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <User className="text-blue-600" size={24} />
            <h2 className="text-lg font-bold text-gray-800">Profile Details</h2>
          </div>
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:outline-none bg-gray-50"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
              <input
                type="email"
                required
                className="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium">
              Save Profile Changes
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Lock className="text-blue-600" size={24} />
            <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordUpdate}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Current Password</label>
              <input
                type="password"
                required
                className="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">New Password</label>
              <input
                type="password"
                required
                className="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1 text-gray-700">Confirm New Password</label>
              <input
                type="password"
                required
                className="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              />
            </div>
            <button type="submit" className="w-full bg-gray-800 text-white py-2.5 rounded-lg hover:bg-gray-900 font-medium">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;