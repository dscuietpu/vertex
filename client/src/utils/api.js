import axios from 'axios';
import { getToken } from './auth';

const API_BASE = '/api';

/** Returns Authorization header with stored JWT, or empty object if not logged in. */
function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Submit a new civic issue (multipart form with image + location).
 * Requires Citizen role — JWT is sent automatically.
 */
export async function submitIssue(formData) {
  const response = await axios.post(`${API_BASE}/issues`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...authHeader(),
    },
  });
  return response.data;
}

/**
 * Fetch all issues with optional filters (public — no auth required).
 * @param {{ search?: string, priority?: string, status?: string }} params
 */
export async function fetchIssues(params = {}) {
  const response = await axios.get(`${API_BASE}/issues`, { params });
  return response.data;
}

/**
 * Update issue status — GOV role only. JWT is sent automatically.
 * @param {string} id - Issue MongoDB _id
 * @param {'Pending'|'In Progress'|'Resolved'} status
 */
export async function updateIssueStatus(id, status) {
  const response = await axios.put(
    `${API_BASE}/issues/${id}`,
    { status },
    { headers: authHeader() }
  );
  return response.data;
}

/**
 * Fetch heatmap coordinate data (public).
 */
export async function fetchHeatmapData() {
  const response = await axios.get(`${API_BASE}/issues/heatmap`);
  return response.data;
}
