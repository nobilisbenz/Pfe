import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const PaymentForm = ({ payment, students, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    type: 'tuition',
    paymentMethod: 'card',
    description: ''
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        studentId: payment.studentId || '',
        amount: payment.amount || '',
        type: payment.type || 'tuition',
        paymentMethod: payment.paymentMethod || 'card',
        description: payment.description || ''
      });
    }
  }, [payment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {payment ? 'Modifier le paiement' : 'Nouveau paiement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Étudiant
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Sélectionner un étudiant</option>
                {students?.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de paiement
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="tuition">Frais de scolarité</option>
                <option value="exam">Frais d'examen</option>
                <option value="material">Matériel pédagogique</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="card">Carte bancaire</option>
                <option value="cash">Espèces</option>
                <option value="transfer">Virement bancaire</option>
                <option value="check">Chèque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field min-h-[100px]"
                placeholder="Ajoutez une description ou des notes..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-mandarine-600 text-white rounded-md hover:bg-mandarine-700"
            >
              <FiSave className="w-5 h-5 mr-2" />
              {payment ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;