import { useState, useEffect } from 'react';
import { FiDollarSign, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const FinanceOverview = () => {
  const [financeData] = useState({
    totalRevenue: 125000,
    expenses: 45000,
    pendingPayments: 15000,
    revenueGrowth: 12.5,
    recentTransactions: [
      {
        id: 1,
        type: 'income',
        description: 'Paiement frais de scolarité',
        amount: 2500,
        date: '2024-03-19',
        status: 'completed'
      },
      {
        id: 2,
        type: 'expense',
        description: 'Matériel pédagogique',
        amount: 1200,
        date: '2024-03-18',
        status: 'completed'
      },
      {
        id: 3,
        type: 'income',
        description: 'Inscription formation continue',
        amount: 1800,
        date: '2024-03-17',
        status: 'pending'
      }
    ]
  });

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenu total</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(financeData.totalRevenue)}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FiArrowUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">+{financeData.revenueGrowth}%</span>
            <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Dépenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(financeData.expenses)}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-full">
              <FiDollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FiArrowDown className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm text-red-500">-8.1%</span>
            <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Paiements en attente</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(financeData.pendingPayments)}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-full">
              <FiDollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">12 paiements en attente</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Bénéfice net</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(financeData.totalRevenue - financeData.expenses)}
              </p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FiArrowUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">+15.3%</span>
            <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions récentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody>
              {financeData.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900">{transaction.description}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatAmount(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {transaction.status === 'completed' ? 'Complété' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceOverview;