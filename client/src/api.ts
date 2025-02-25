import axios from "axios";

const URL = "http://localhost:5000/api/";

export const signUpUser = async (username: string, password: string) => {
  const response = await axios.post(`${URL}users/signup`, { username, password });
  return response;
};

export const loginUser = async (username: string, password: string) => {
  const response = await axios.post(`${URL}users/login`, { username, password });
  return response;
};

export const fetchMatchs = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    const response = await axios.get(`${URL}matches/user/${userId}?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('API error in fetchMatchs:', error);
    throw error;
  }
};

export const createMatch = async (userId: string, result: string) => {
  const response = await axios.post(`${URL}matches`, { user: userId, result });
  return response;
};

export const changeUsername = async (data: { userId: string, currentPassword: string, newUsername: string }) => {
  const response = await axios.patch(`${URL}users/change-username`, data);
  return response;
};

// Admin endpoints
export const fetchAdminUsers = async (page: number = 1, limit: number = 10) => {
  const response = await axios.get(`${URL}admin/users?page=${page}&limit=${limit}`);
  return response;
};

export const fetchAdminMatches = async (page: number = 1, limit: number = 10) => {
  const response = await axios.get(`${URL}admin/matches?page=${page}&limit=${limit}`);
  return response;
};

export const adminDeleteMatch = async (adminData: { adminUsername: string, adminPassword: string }, matchId: string) => {
  const response = await axios.delete(`${URL}admin/match/${matchId}`, { data: adminData });
  return response;
};

export const adminDeleteMatchesBulk = async (adminData: { adminUsername: string, adminPassword: string, ids: string[] }) => {
  const response = await axios.delete(`${URL}admin/matches/bulk`, { data: adminData });
  return response;
};

export const adminDeleteAllMatches = async (adminData: { adminUsername: string, adminPassword: string }) => {
  const response = await axios.delete(`${URL}admin/matches/all`, { data: adminData });
  return response;
};

export const adminDeleteUser = async (adminData: { adminUsername: string, adminPassword: string }, userId: string) => {
  const response = await axios.delete(`${URL}admin/user/${userId}`, { data: adminData });
  return response;
};

export const deleteUserMatch = async (data: { userId: string, password: string }, matchId: string) => {
  const response = await axios.delete(`${URL}matches/${matchId}`, { data });
  return response;
};

export const deleteUserMatchesBulk = async (data: { userId: string, password: string, ids: string[] }) => {
  try {
    const response = await axios.delete(`${URL}matches/bulk`, { 
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const deleteUserAllMatches = async (data: { userId: string, password: string }) => {
  try {
    const response = await axios.delete(`${URL}matches/all`, { 
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
