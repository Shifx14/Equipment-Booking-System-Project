import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, CheckCircle, Clock } from 'lucide-react';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('issued');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/bookings/inventory');
      setItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'pending_issue') return item.status === 'pending_issue';
    if (activeTab === 'issued') return item.status === 'issued';
    if (activeTab === 'returned') return item.status === 'returned';
    return true;
  });

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Inventory</h1>
        <p className="text-gray-500 text-sm">Track your approved loans, current possessions, and return history.</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium border-b-2 ${
            activeTab === 'issued' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('issued')}
        >
          <Package size={18} /> Active Loans ({items.filter(i => i.status === 'issued').length})
        </button>
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium border-b-2 ${
            activeTab === 'pending_issue' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pending_issue')}
        >
          <Clock size={18} /> Awaiting Pickup ({items.filter(i => i.status === 'pending_issue').length})
        </button>
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium border-b-2 ${
            activeTab === 'returned' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('returned')}
        >
          <CheckCircle size={18} /> Loan History ({items.filter(i => i.status === 'returned').length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col">
            <div className="flex gap-4 mb-4">
              <img 
                src={item.equipment?.photo_url || 'https://via.placeholder.com/80'} 
                alt={item.equipment?.name}
                className="w-20 h-20 rounded object-cover border"
              />
              <div>
                <h3 className="font-bold text-lg text-gray-800 leading-tight">{item.equipment?.name}</h3>
                <p className="text-gray-500 text-sm mt-1">Qty: {item.quantity}</p>
                {item.status === 'issued' && isOverdue(item.due_date) && (
                  <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold">
                    Overdue
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded p-4 flex-1 text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Start Date:</span>
                <span>{new Date(item.start_date).toLocaleDateString()}</span>
              </div>
              
              {activeTab !== 'returned' && (
                <div className={`flex justify-between ${isOverdue(item.due_date) && item.status === 'issued' ? 'text-red-600 font-bold' : ''}`}>
                  <span className="font-medium">Due Date:</span>
                  <span>{new Date(item.due_date).toLocaleDateString()}</span>
                </div>
              )}

              {activeTab === 'returned' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Returned At:</span>
                    <span>{new Date(item.returned_at).toLocaleDateString()}</span>
                  </div>
                  {(item.is_late || item.is_damaged) && (
                    <div className="pt-2 border-t mt-2 flex gap-2 flex-wrap">
                      {item.is_late && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium">Returned Late</span>}
                      {item.is_damaged && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">Damage Logged</span>}
                    </div>
                  )}
                  {item.admin_notes && (
                    <div className="pt-2 border-t mt-2">
                      <span className="font-medium block text-gray-500 text-xs">Admin Note:</span>
                      <p className="text-xs italic mt-1">{item.admin_notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg border border-dashed">
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;