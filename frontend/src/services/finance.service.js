import axios from '../config/axios.config';

class FinanceService {
  async getFinancialOverview() {
    const response = await axios.get('/api/finance/overview');
    return response.data;
  }

  async getTransactions(params) {
    const response = await axios.get('/api/finance/transactions', { params });
    return response.data;
  }

  async addTransaction(transactionData) {
    const response = await axios.post('/api/finance/transactions', transactionData);
    return response.data;
  }

  async updateTransaction(id, transactionData) {
    const response = await axios.put(`/api/finance/transactions/${id}`, transactionData);
    return response.data;
  }

  async deleteTransaction(id) {
    const response = await axios.delete(`/api/finance/transactions/${id}`);
    return response.data;
  }
}

export const financeService = new FinanceService();