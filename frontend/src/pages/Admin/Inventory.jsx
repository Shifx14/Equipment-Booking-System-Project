import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Tag, Box } from 'lucide-react';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  const [categories, setCategories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    category_id: '',
    price: 0,
    photo_url: '',
    total_qty: 1,
    available_qty: 1,
    status: 'in_stock'
  });

  useEffect(() => {
    fetchCategories();
    fetchEquipment();
  }, []);

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
      const res = await axios.get('http://localhost:8000/api/equipment');
      setEquipmentList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/admin/categories', categoryForm);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      fetchCategories();
    } catch (e) {
      alert(e.response?.data?.detail || 'Error creating category');
    }
  };

  const handleEquipmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...equipmentForm,
        category_id: parseInt(equipmentForm.category_id),
        price: parseInt(equipmentForm.price),
        total_qty: parseInt(equipmentForm.total_qty),
        available_qty: parseInt(equipmentForm.available_qty)
      };

      if (editingEquipmentId) {
        await axios.put(`http://localhost:8000/api/admin/equipment/${editingEquipmentId}`, payload);
      } else {
        await axios.post('http://localhost:8000/api/admin/equipment', payload);
      }

      setShowEquipmentModal(false);
      setEditingEquipmentId(null);
      resetEquipmentForm();
      fetchEquipment();
    } catch (e) {
      alert(e.response?.data?.detail || 'Error saving equipment');
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/equipment/${id}`);
      fetchEquipment();
    } catch (e) {
      alert('Error deleting equipment');
    }
  };

  const openEditEquipmentModal = (item) => {
    setEditingEquipmentId(item.id);
    setEquipmentForm({
      name: item.name,
      category_id: item.category_id,
      price: item.price,
      photo_url: item.photo_url || '',
      total_qty: item.total_qty,
      available_qty: item.available_qty,
      status: item.status
    });
    setShowEquipmentModal(true);
  };

  const resetEquipmentForm = () => {
    setEquipmentForm({
      name: '',
      category_id: categories[0]?.id || '',
      price: 0,
      photo_url: '',
      total_qty: 1,
      available_qty: 1,
      status: 'in_stock'
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 text-sm">Manage assets, categories, pricing, and quantities.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { resetEquipmentForm(); setShowEquipmentModal(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} /> Add Equipment
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium border-b-2 ${
            activeTab === 'equipment' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
          onClick={() => setActiveTab('equipment')}
        >
          <Box size={18} /> Equipment Assets ({equipmentList.length})
        </button>
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium border-b-2 ${
            activeTab === 'categories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={18} /> Categories ({categories.length})
        </button>
      </div>

      {activeTab === 'equipment' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4">Asset</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price / Day</th>
                <th className="p-4">Qty (Avail/Total)</th>
                <th className="p-4">Condition Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={item.photo_url || 'https://via.placeholder.com/40'}
                      alt={item.name}
                      className="w-10 h-10 rounded object-cover border"
                    />
                    <span className="font-semibold text-gray-800">{item.name}</span>
                  </td>
                  <td className="p-4 text-gray-600">{item.category?.name || 'Uncategorized'}</td>
                  <td className="p-4 font-medium text-gray-800">${item.price}</td>
                  <td className="p-4 text-gray-600">{item.available_qty} / {item.total_qty}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded font-semibold capitalize ${
                      item.status === 'in_stock' ? 'bg-green-100 text-green-700' :
                      item.status === 'rented' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditEquipmentModal(item)} className="p-2 text-gray-600 hover:text-blue-600">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteEquipment(item.id)} className="p-2 text-gray-600 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
              <p className="text-gray-500 text-sm mt-2">{cat.description || 'No description provided.'}</p>
            </div>
          ))}
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <form onSubmit={handleCategorySubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Category</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full border rounded p-2"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded p-2"
                rows="3"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border rounded text-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <form onSubmit={handleEquipmentSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editingEquipmentId ? 'Edit Equipment' : 'Add Equipment'}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded p-2"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  required
                  className="w-full border rounded p-2"
                  value={equipmentForm.category_id}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Daily Rental Price ($)</label>
                <input
                  type="number"
                  required
                  className="w-full border rounded p-2"
                  value={equipmentForm.price}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, price: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Photo URL</label>
                <input
                  type="url"
                  className="w-full border rounded p-2"
                  value={equipmentForm.photo_url}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, photo_url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Quantity</label>
                <input
                  type="number"
                  required
                  className="w-full border rounded p-2"
                  value={equipmentForm.total_qty}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, total_qty: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Available Quantity</label>
                <input
                  type="number"
                  required
                  className="w-full border rounded p-2"
                  value={equipmentForm.available_qty}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, available_qty: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Condition / Status</label>
                <select
                  className="w-full border rounded p-2"
                  value={equipmentForm.status}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value })}
                >
                  <option value="in_stock">In Stock</option>
                  <option value="rented">Rented</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEquipmentModal(false)}
                className="px-4 py-2 border rounded text-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                Save Asset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Inventory;