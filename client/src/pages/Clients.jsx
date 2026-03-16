import React, { useState } from 'react';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import { useClientsData } from '../hooks/useClientsData';
import ClientForm from '../components/clients/ClientForm';
import Loader from '../components/ui/Loader';

const Clients = () => {
  const { clients, loading, error, addClient, updateClient, deleteClient } = useClientsData();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSubmit = async (formData) => {
    setIsSubmitting(true);
    
    // Conditionally route to either create or update logic
    const res = editingClient
      ? await updateClient(editingClient._id, formData)
      : await addClient(formData);
      
    setIsSubmitting(false);
    if (res.success) {
      setShowForm(false);
      setEditingClient(null);
    } else {
      alert(res.error);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all the clients you generate invoices for.</p>
        </div>
        <div className="mt-4 sm:flex-none sm:ml-16">
          <button 
            type="button" 
            onClick={() => {
              if (showForm) setEditingClient(null);
              setShowForm(!showForm);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" /> {showForm ? 'Cancel' : 'Add Client'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 p-4 border-l-4 border-red-400">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mt-6 mb-8">
          <ClientForm 
            key={editingClient ? editingClient._id : 'new'}
            initialData={editingClient || {}}
            onSubmit={handleAddSubmit} 
            isLoading={isSubmitting} 
          />
        </div>
      )}

      <div className="mt-8 flex flex-col">
        {loading ? (
          <Loader />
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Search Bar */}
            {(clients.length > 0 || searchTerm) && (
              <div className="p-4 border-b border-gray-100 bg-white">
                <div className="relative w-full sm:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {clients.length === 0 ? (
              <div className="px-4 py-12 sm:p-12 text-center text-gray-500">
                No clients added yet. Click "Add Client" to get started.
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="px-4 py-12 sm:p-12 text-center text-gray-500">
                No clients matched your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.company || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.email}</div>
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-900 ml-4 group" title="Edit Client">
                            <Edit className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                          <button onClick={() => handleDelete(client._id)} className="text-red-600 hover:text-red-900 ml-4 group" title="Delete Client">
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
