import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Calendar } from 'lucide-react';

const EquipmentCatalog = () => {
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    quantity: 1,
    start_date: '',
    due_date: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchEquipment();
  }, [searchQuery, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/categories');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEquipment = async () => {
    try {
      let url = 'http://localhost:8000/api/equipment?';
      if (searchQuery) url += `search=${searchQuery}&`;
      if (selectedCategory) url += `category_id=${selectedCategory}`;
      
      const res = await axios.get(url);
      setEquipment(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const openBookingModal = (item) => {
    setSelectedAsset(item);
    setBookingForm({ quantity: 1, start_date: '', due_date: '' });
    setShowModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        equipment_id: selectedAsset.id,
        quantity: parseInt(bookingForm.quantity),
        start_date: new Date(bookingForm.start_date).toISOString(),
        due_date: new Date(bookingForm.due_date).toISOString()
      };
      
      await axios.post('http://localhost:8000/api/bookings', payload);
      alert('Booking request submitted successfully!');
      setShowModal(false);
      setSelectedAsset(null);
    } catch (e) {
      alert(e.response?.data?.detail || 'Error submitting booking');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Equipment Catalog</h1>
        <p className="text-gray-500 text-sm">Browse and request available gear.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search equipment..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-64 relative">
          <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
          <select
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 appearance-none bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {equipment.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden flex flex-col">
            <img 
              src={item.photo_url || 'https://via.placeholder.com/300x200'} 
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{item.name}</h3>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {item.category?.name}
                </span>
              </div>
              <div className="text-gray-600 text-sm mb-4 flex-1">
                <p>Rental Price: ${item.price} / day</p>
                <p className={`font-medium ${item.available_qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Available: {item.available_qty} / {item.total_qty}
                </p>
              </div>
              <button
                disabled={item.available_qty === 0 || item.status !== 'in_stock'}
                onClick={() => openBookingModal(item)}
                className={`w-full py-2 rounded font-medium flex justify-center items-center gap-2 ${
                  item.available_qty > 0 && item.status === 'in_stock'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Calendar size={18} />
                Request Booking
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleBookingSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Request Booking</h2>
            <p className="text-gray-500 text-sm mb-4">Requesting: {selectedAsset.name}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Quantity Required</label>
              <input
                type="number"
                required
                min="1"
                max={selectedAsset.available_qty}
                className="w-full border rounded p-2"
                value={bookingForm.quantity}
                onChange={(e) => setBookingForm({...bookingForm, quantity: e.target.value})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                required
                className="w-full border rounded p-2"
                value={bookingForm.start_date}
                onChange={(e) => setBookingForm({...bookingForm, start_date: e.target.value})}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Return Date</label>
              <input
                type="date"
                required
                className="w-full border rounded p-2"
                value={bookingForm.due_date}
                onChange={(e) => setBookingForm({...bookingForm, due_date: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded text-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EquipmentCatalog;