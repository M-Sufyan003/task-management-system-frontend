import api from './axiosInstance';

// POST /api/auth/signup  — body: { name, email, password }
// Returns: { message: "User registered successfully" }
export const signupApi = (data) => api.post('/auth/signup', data);

// POST /api/auth/login   — body: { email, password }
// Returns: { message: "Login successful", token: "<jwt>" }
export const loginApi = (data) => api.post('/auth/login', data);
