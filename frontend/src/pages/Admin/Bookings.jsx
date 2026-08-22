import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [rejectModal, setRejectModal] = useState({ show: false, id: null, notes: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/bookings');
      setBookings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDecision = async (id, status, notes = '') => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/bookings/${id}/decision`, {
        status,
        admin_notes: notes
      });
      fetchBookings();
      if (status === 'rejected') {
        setRejectModal({ show: false, id: null, notes: '' });
      }
    } catch (e) {
      alert(e.response?.data?.detail || 'Error updating booking decision');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'approved') return b.status === 'pending_issue' || b.status === 'issued' || b.status === 'returned';
    if (filter === 'rejected') return b.status === 'rejected';
    return true;
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bookings Workspace</h1>
        <p className="text-gray-500 text-sm">Review, approve, and reject equipment requests.</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm">
              <th className="p-4">User</th>
              <th className="p-4">Equipment</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-800">{b.user?.name || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{b.user?.email}</div>
                </td>
                <td className="p-4 font-medium text-gray-800">{b.equipment?.name}</td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(b.start_date).toLocaleDateString()} - {new Date(b.due_date).toLocaleDateString()}
                </td>
                <td className="p-4 text-gray-800 font-medium">{b.quantity}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded font-semibold capitalize ${
                    b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    b.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {b.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDecision(b.id, 'approved')}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        title="Approve Request"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => setRejectModal({ show: true, id: b.id, notes: '' })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Reject Request"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject Request</h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows="3"
              placeholder="Reason for rejection (optional)"
              value={rejectModal.notes}
              onChange={(e) => setRejectModal({ ...rejectModal, notes: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModal({ show: false, id: null, notes: '' })}
                className="px-4 py-2 border rounded text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision(rejectModal.id, 'rejected', rejectModal.notes)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;