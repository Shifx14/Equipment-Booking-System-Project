import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/bookings/requests');
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelRequest = async (id) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/bookings/requests/${id}`);
      fetchRequests();
    } catch (e) {
      alert(e.response?.data?.detail || 'Error cancelling request');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
        <p className="text-gray-500 text-sm">View and manage your pending equipment booking requests.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm">
              <th className="p-4">Equipment</th>
              <th className="p-4">Date Requested</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                  <img 
                    src={req.equipment?.photo_url || 'https://via.placeholder.com/40'} 
                    alt={req.equipment?.name} 
                    className="w-10 h-10 rounded object-cover border" 
                  />
                  {req.equipment?.name}
                </td>
                <td className="p-4 text-gray-600">{new Date(req.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(req.start_date).toLocaleDateString()} - {new Date(req.due_date).toLocaleDateString()}
                </td>
                <td className="p-4 text-gray-800 font-medium">{req.quantity}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs rounded font-semibold bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleCancelRequest(req.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Cancel Request"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">You have no pending requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requests;