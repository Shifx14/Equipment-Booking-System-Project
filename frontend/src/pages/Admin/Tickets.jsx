import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, MessageSquare } from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState('open');

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

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

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

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/support/tickets/${selectedTicket.id}/status`, {
        status: newStatus
      });
      fetchTickets();
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    } catch (e) {
      alert(e.response?.data?.detail || 'Error updating status');
    }
  };

  return (
    <div className="p-8 flex h-screen max-h-screen overflow-hidden box-border">
      <div className="w-1/3 border-r pr-6 flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Support Resolution</h1>
          <p className="text-gray-500 text-sm">Manage user inquiries and issues.</p>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['open', 'in_review', 'resolved', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm font-medium capitalize whitespace-nowrap ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 space-y-3 pb-16">
          {filteredTickets.map(ticket => (
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
              <p className="text-xs text-gray-600 mb-1">User: {ticket.user?.name}</p>
              <p className="text-xs text-gray-500 mb-1">Category: {ticket.category}</p>
              <p className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="text-center text-gray-500 mt-8">No tickets in this queue.</div>
          )}
        </div>
      </div>

      <div className="flex-1 pl-6 flex flex-col h-full pb-16">
        {selectedTicket ? (
          <>
            <div className="border-b pb-4 mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                  <span>Ticket #{selectedTicket.id}</span>
                  <span>•</span>
                  <span>User ID: {selectedTicket.user_id}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedTicket.status !== 'in_review' && selectedTicket.status !== 'resolved' && (
                  <button onClick={() => handleStatusChange('in_review')} className="px-3 py-1.5 bg-purple-100 text-purple-800 font-medium rounded hover:bg-purple-200 text-sm">
                    Mark In Review
                  </button>
                )}
                {selectedTicket.status !== 'resolved' && (
                  <button onClick={() => handleStatusChange('resolved')} className="px-3 py-1.5 bg-green-100 text-green-800 font-medium rounded hover:bg-green-200 text-sm">
                    Mark Resolved
                  </button>
                )}
                {selectedTicket.status === 'resolved' && (
                  <button onClick={() => handleStatusChange('open')} className="px-3 py-1.5 bg-yellow-100 text-yellow-800 font-medium rounded hover:bg-yellow-200 text-sm">
                    Re-open Ticket
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {comments.map(c => (
                <div key={c.id} className={`flex flex-col ${c.sender?.role === 'admin' ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1">{c.sender?.name} ({c.sender?.role}) • {new Date(c.created_at).toLocaleString()}</span>
                  <div className={`p-3 rounded-lg max-w-md ${
                    c.sender?.role === 'admin' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {c.comment}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Type an official response..."
                className="flex-1 border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p>Select a ticket to review and respond</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;