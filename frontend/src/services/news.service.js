import api from '../config/axios.config';

class NewsService {
  async getAllNews() {
    const response = await api.get('/news');
    return response.data;
  }

  async getNews(id) {
    const response = await api.get(`/news/${id}`);
    return response.data;
  }

  async createNews(data) {
    const response = await api.post('/news', data);
    return response.data;
  }

  async updateNews(id, data) {
    const response = await api.put(`/news/${id}`, data);
    return response.data;
  }

  async deleteNews(id) {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  }
}

export const newsService = new NewsService();