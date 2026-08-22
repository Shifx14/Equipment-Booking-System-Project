import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, LogIn } from 'lucide-react';

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [returnModal, setReturnModal] = useState({ show: false, id: null, is_late: false, is_damaged: false, admin_notes: '' });

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/bookings');
      setRentals(res.data.filter(b => b.status === 'pending_issue' || b.status === 'issued'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleIssue = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/rentals/${id}/issue`);
      fetchRentals();
    } catch (e) {
      alert(e.response?.data?.detail || 'Error issuing rental');
    }
  };

  const handleReturnSubmit = async () => {
    try {
      const payload = {
        is_late: returnModal.is_late,
        is_damaged: returnModal.is_damaged,
        admin_notes: returnModal.admin_notes
      };
      await axios.patch(`http://localhost:8000/api/admin/rentals/${returnModal.id}/return`, payload);
      setReturnModal({ show: false, id: null, is_late: false, is_damaged: false, admin_notes: '' });
      fetchRentals();
    } catch (e) {
      alert(e.response?.data?.detail || 'Error returning rental');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rentals Operations Desk</h1>
        <p className="text-gray-500 text-sm">Manage physical check-out and check-in workflows.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm">
              <th className="p-4">User</th>
              <th className="p-4">Equipment</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Qty</th>
              <th className="p-4">State</th>
              <th className="p-4 text-right">Desk Action</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{r.user?.name}</td>
                <td className="p-4 text-gray-600">{r.equipment?.name}</td>
                <td className="p-4 text-gray-600">{new Date(r.due_date).toLocaleDateString()}</td>
                <td className="p-4 font-medium text-gray-800">{r.quantity}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded font-semibold capitalize ${
                    r.status === 'pending_issue' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {r.status === 'pending_issue' ? (
                    <button
                      onClick={() => handleIssue(r.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
                    >
                      <LogOut size={16} /> Check Out
                    </button>
                  ) : (
                    <button
                      onClick={() => setReturnModal({ show: true, id: r.id, is_late: false, is_damaged: false, admin_notes: '' })}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      <LogIn size={16} /> Check In
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rentals.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No active rental operations queued.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {returnModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Process Return</h2>
            
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnModal.is_late}
                  onChange={(e) => setReturnModal({ ...returnModal, is_late: e.target.checked })}
                  className="w-4 h-4"
                />
                Mark as Late Return
              </label>
              
              <label className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnModal.is_damaged}
                  onChange={(e) => setReturnModal({ ...returnModal, is_damaged: e.target.checked })}
                  className="w-4 h-4"
                />
                Mark Equipment as Damaged
              </label>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Administrative Notes</label>
              <textarea
                className="w-full border rounded p-2"
                rows="3"
                placeholder="Log condition, wear, or repair needs..."
                value={returnModal.admin_notes}
                onChange={(e) => setReturnModal({ ...returnModal, admin_notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReturnModal({ show: false, id: null, is_late: false, is_damaged: false, admin_notes: '' })}
                className="px-4 py-2 border rounded text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Finalize Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rentals;