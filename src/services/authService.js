// services/authService.js
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}auth`; // Update with your backend URL

// Signup User
export const signup = async (userData) => {
    return await axios.post(`${API_URL}/signup`, userData);
};

// Login User
export const login = async (userData) => {
    return await axios.post(`${API_URL}/login`, userData);
};
