import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Send, Plus, MessageSquare } from 'lucide-react';

const Support = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'General', initial_comment: '' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/support/tickets');
      setTickets(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await axios.get(`http://localhost:8000/api/support/tickets/${ticket.id}/comments`);
      setComments(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`http://localhost:8000/api/support/tickets/${selectedTicket.id}/comments`, {
        comment: newComment
      });
      setNewComment('');
      handleSelectTicket(selectedTicket);
    } catch (e) {
      alert(e.response?.data?.detail || 'Error posting comment');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/support/tickets', ticketForm);
      setShowNewTicketModal(false);
      setTicketForm({ subject: '', category: 'General', initial_comment: '' });
      fetchTickets();
    } catch (e) {
      alert(e.response?.data?.detail || 'Error creating ticket');
    }
  };

  return (
    <div className="p-8 flex h-screen max-h-screen overflow-hidden box-border">
      <div className="w-1/3 border-r pr-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Support Desk</h1>
            <p className="text-gray-500 text-sm">Need help? Open a ticket.</p>
          </div>
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-3">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => handleSelectTicket(ticket)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTicket?.id === ticket.id ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 line-clamp-1">{ticket.subject}</h3>
                <span className={`text-xs px-2 py-1 rounded font-medium capitalize ${
                  ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'in_review' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">Category: {ticket.category}</p>
              <p className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="text-center text-gray-500 mt-8">No tickets found.</div>
          )}
        </div>
      </div>

      <div className="flex-1 pl-6 flex flex-col h-full pb-16">
        {selectedTicket ? (
          <>
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
              <div className="flex gap-4 text-sm text-gray-500 mt-1">
                <span>Ticket #{selectedTicket.id}</span>
                <span>•</span>
                <span>{selectedTicket.category}</span>
                <span>•</span>
                <span className="capitalize">{selectedTicket.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {comments.map(c => (
                <div key={c.id} className={`flex flex-col ${c.sender_id === parseInt(user?.id) ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1">{c.sender?.name || 'Admin'} • {new Date(c.created_at).toLocaleString()}</span>
                  <div className={`p-3 rounded-lg max-w-md ${
                    c.sender_id === parseInt(user?.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {c.comment}
                  </div>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'resolved' ? (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
                  <Send size={20} />
                </button>
              </form>
            ) : (
              <div className="p-4 bg-gray-50 text-center text-gray-500 rounded-lg">
                This ticket has been marked as resolved and is closed to new comments.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p>Select a ticket to view the conversation</p>
          </div>
        )}
      </div>

      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateTicket} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Open Support Ticket</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                required
                className="w-full border rounded p-2"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full border rounded p-2"
                value={ticketForm.category}
                onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
              >
                <option value="General">General Inquiry</option>
                <option value="Equipment Issue">Equipment Issue</option>
                <option value="Booking Problem">Booking Problem</option>
                <option value="Account Access">Account Access</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                required
                className="w-full border rounded p-2"
                rows="4"
                value={ticketForm.initial_comment}
                onChange={(e) => setTicketForm({...ticketForm, initial_comment: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="px-4 py-2 border rounded text-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Support;