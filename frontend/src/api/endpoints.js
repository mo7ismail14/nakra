// Every backend endpoint, grouped. Pages import from here, never build URLs themselves.
import { http } from './client.js';

const pub = { auth: false };

export const authApi = {
  login: (email, password) => http.post('/auth/login', { email, password }, pub),
  me: () => http.get('/auth/me'),
  forgotPassword: (email) => http.post('/auth/forgot-password', { email }, pub),
  resetInfo: (token) => http.get(`/auth/reset-password/${token}`, pub),
  resetPassword: (token, password) => http.post('/auth/reset-password', { token, password }, pub),
};

export const adminsApi = {
  list: () => http.get('/admins'),
  create: (email) => http.post('/admins', { email }),
  resendSetup: (id) => http.post(`/admins/${id}/resend-setup`),
  remove: (id) => http.delete(`/admins/${id}`),
};

const r = (id) => `/restaurants/${id}`;

export const restaurantsApi = {
  list: () => http.get('/restaurants'),
  get: (id) => http.get(r(id)),
  create: (formData) => http.post('/restaurants', formData),
  update: (id, formData) => http.patch(r(id), formData),
  remove: (id) => http.delete(r(id)),
  qrCodes: (id) => http.get(`${r(id)}/qr-codes`),
  sendInvitation: (id, email) => http.post(`${r(id)}/invitation`, email ? { email } : {}),
  revokeInvitation: (id) => http.delete(`${r(id)}/invitation`),
  removeOwner: (id) => http.delete(`${r(id)}/owner`),
};

const c = (id, categoryId) => `${r(id)}/categories${categoryId ? `/${categoryId}` : ''}`;

export const menuApi = {
  addCategory: (id, name) => http.post(c(id), { name }),
  updateCategory: (id, categoryId, name) => http.patch(c(id, categoryId), { name }),
  deleteCategory: (id, categoryId) => http.delete(c(id, categoryId)),
  reorderCategories: (id, ids) => http.put(`${c(id)}/order`, { ids }),

  addItem: (id, categoryId, formData) => http.post(`${c(id, categoryId)}/items`, formData),
  updateItem: (id, categoryId, itemId, body) => http.patch(`${c(id, categoryId)}/items/${itemId}`, body),
  deleteItem: (id, categoryId, itemId) => http.delete(`${c(id, categoryId)}/items/${itemId}`),
  reorderItems: (id, categoryId, ids) => http.put(`${c(id, categoryId)}/items/order`, { ids }),
};

export const invitationsApi = {
  info: (token) => http.get(`/invitations/${token}`, pub),
  accept: (token, password) => http.post(`/invitations/${token}/accept`, { password }, pub),
};

export const publicApi = {
  menu: (slug) => http.get(`/public/menu/${slug}`, pub),
};
