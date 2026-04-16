import axios from 'axios';

const API_BASE = '/api';

/**
 * Submit a new civic issue (multipart form with image + location)
 */
export async function submitIssue(formData) {
  const response = await axios.post(`${API_BASE}/issues`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Fetch all issues with optional filters
 * @param {{ search?: string, priority?: string, status?: string }} params
 */
export async function fetchIssues(params = {}) {
  const response = await axios.get(`${API_BASE}/issues`, { params });
  return response.data;
}

/**
 * Update issue status
 * @param {string} id - Issue MongoDB _id
 * @param {'Pending'|'In Progress'|'Resolved'} status
 */
export async function updateIssueStatus(id, status) {
  const response = await axios.put(`${API_BASE}/issues/${id}`, { status });
  return response.data;
}

/**
 * Fetch heatmap coordinate data
 */
export async function fetchHeatmapData() {
  const response = await axios.get(`${API_BASE}/issues/heatmap`);
  return response.data;
}
