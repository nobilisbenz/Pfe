import api from "../config/axios.config";

class AuthService {
  async login(email, password, userType) {
    try {
      const response = await api.post(`/${userType}/login`, {
        email,
        password,
      });

      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }

      if (response.data.status === "success" && response.data.data) {
        const token = response.data.data;
        let tokenData;
        try {
          tokenData = JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
          throw new Error("Token invalide");
        }

        if (!tokenData.role) {
          throw new Error("Token invalide: rôle manquant");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("userType", userType);
        localStorage.setItem("userName", tokenData.name || "");
        localStorage.setItem("userRole", tokenData.role);

        return {
          token,
          user: {
            name: tokenData.name,
            role: tokenData.role,
            id: tokenData.id,
          },
        };
      }

      throw new Error("Erreur de connexion");
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async register(userData, userType) {
    try {
      let endpoint;
      switch (userType) {
        case "students":
          endpoint = "/students/admin/register";
          break;
        case "teachers":
          endpoint = "/teachers/admin/register";
          break;
        case "admins":
          endpoint = "/admins/register";
          break;
        default:
          throw new Error("Type d'utilisateur non valide");
      }

      // S'assurer que tous les champs requis sont présents
      const { name, email, password, phone } = userData;
      if (!name || !email || !password || !phone) {
        throw new Error("Tous les champs sont requis");
      }

      const response = await api.post(endpoint, userData);

      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la création de l'utilisateur",
      );
    }
  }

  async updateUser(id, userData) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non autorisé");

      const userType = userData.role;
      const isSelfUpdate = !id; // Si pas d'ID fourni, c'est une mise à jour de son propre profil

      let endpoint;
      if (isSelfUpdate) {
        endpoint = `/${userType}s/update`; // Route pour mise à jour de son propre profil
      } else {
        endpoint = `/${userType}s/${id}/update/admin`; // Route pour mise à jour par l'admin
      }

      const response = await api.put(endpoint, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }

      // Mettre à jour le nom d'utilisateur dans le localStorage si c'est une mise à jour de son propre profil
      if (isSelfUpdate && userData.name) {
        localStorage.setItem("userName", userData.name);
      }

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil",
      );
    }
  }

  async deleteUser(id) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non autorisé");

      const users = await this.getAllUsers();
      const user = users.data.find((u) => u._id === id);
      if (!user) throw new Error("Utilisateur non trouvé");

      const userType = user.role + "s";
      const response = await api.delete(`/${userType}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la suppression de l'utilisateur",
      );
    }
  }

  async getAllUsers() {
    try {
      const response = await api.get("/admins/users");
      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      console.error("Erreur getAllUsers:", error);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération des utilisateurs",
      );
    }
  }

  async getProfile(userType) {
    try {
      const response = await api.get(`/${userType}/profile`);
      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération du profil",
      );
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
  }

  isAuthenticated() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      if (tokenData.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  getUserType() {
    return localStorage.getItem("userType");
  }

  getUserRole() {
    return localStorage.getItem("userRole");
  }

  getUserName() {
    return localStorage.getItem("userName");
  }
}

export const authService = new AuthService();

