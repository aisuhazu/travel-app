import axios from "axios";
import { auth } from "./firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getStats: () => api.get("/users/stats"),
};

export const tripAPI = {
  getTrips: (params) => api.get("/trips", { params }),
  getTrip: (id) => api.get(`/trips/${id}`),
  createTrip: (data) => api.post("/trips", data),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  likeTrip: (id) => api.post(`/trips/${id}/like`),
  unlikeTrip: (id) => api.delete(`/trips/${id}/like`),
};

export const commentAPI = {
  getComments: (tripId) => api.get(`/trips/${tripId}/comments`),
  addComment: (tripId, content) =>
    api.post(`/trips/${tripId}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export default api;

// Update the createTrip and updateTrip functions to handle coordinates
// Update the createTrip function at the bottom of the file
// Update the createTrip and updateTrip functions to handle cover images
const createTrip = async (tripData) => {
  const response = await api.post('/trips', {
    ...tripData,
    latitude: tripData.coordinates?.lat || null,
    longitude: tripData.coordinates?.lng || null,
    country: tripData.country || null,
    country_code: tripData.countryCode || null,
    cover_image: tripData.cover_image || null,
    cover_image_path: tripData.cover_image_path || null
  });
  return response.data;
};

const updateTrip = async (id, tripData) => {
  const response = await api.put(`/trips/${id}`, {
    ...tripData,
    latitude: tripData.coordinates?.lat || null,
    longitude: tripData.coordinates?.lng || null,
    country: tripData.country || null,
    country_code: tripData.countryCode || null,
    cover_image: tripData.cover_image || null,
    cover_image_path: tripData.cover_image_path || null
  });
  return response.data;
};
