import { useState, useEffect } from 'react';
import { FiSend, FiUsers, FiSearch } from 'react-icons/fi';
import { authService } from '../../services/auth.service';
import { messagingService } from '../../services/messaging.service';

const Messaging = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authService.getAllUsers();
      if (response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Veuillez entrer un message');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Veuillez sélectionner au moins un destinataire');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (selectedUsers.length === 1) {
        await messagingService.sendSMS(selectedUsers[0], message);
      } else {
        await messagingService.sendBulkSMS(selectedUsers, message);
      }
      
      setSuccess('Message(s) envoyé(s) avec succès');
      setMessage('');
      setSelectedUsers([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Messagerie SMS</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Rechercher des utilisateurs..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center">
              <FiUsers className="mr-2" />
              Utilisateurs
            </h3>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedUsers.length === filteredUsers.length ? 'Désélectionner tout' : 'Sélectionner tout'}
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleUserSelect(user._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => {}}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <textarea
            placeholder="Écrivez votre message ici..."
            className="w-full h-48 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedUsers.length} destinataire{selectedUsers.length !== 1 ? 's' : ''} sélectionné{selectedUsers.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={loading || selectedUsers.length === 0 || !message.trim()}
              className={`flex items-center px-4 py-2 rounded-lg text-white ${
                loading || selectedUsers.length === 0 || !message.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FiSend className="mr-2" />
              {loading ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;