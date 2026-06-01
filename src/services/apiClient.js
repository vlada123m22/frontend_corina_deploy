/**
 * Centralized API Client for TimeSaver Backend
 * Uses the nginx proxy at /api/ to communicate with the backend
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * Get JWT token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get common headers with authentication
 */
const getHeaders = (includeContentType = true) => {
  const headers = {
    ...(includeContentType && { 'Content-Type': 'application/json' }),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API errors
 */
const handleError = (response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response;
};

/**
 * Generic fetch wrapper
 */
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const { headers: customHeaders, ...restOptions } = options;
  const finalOptions = {
    ...restOptions,
    headers: {
      ...getHeaders(options.method !== 'GET'),
      ...customHeaders,           // caller's headers add to / override individually, not wipe
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    handleError(response);
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`API fetch failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Authentication Endpoints
 */
export const authAPI = {
  signup: async (userRole, userData) => {
    return apiFetch(`/auth/signup/${userRole}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (username, password) => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        UserName: username,
        Password: password,
      }),
    });
  },

  changePassword: async (userName, currentPassword, newPassword) => {
    return apiFetch(`/auth/change-password/${userName}`, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  },

  deleteProfile: async (role) => {
    return apiFetch(`/auth/delete-profile/${role}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Project Management Endpoints
 */
export const projectAPI = {
  getAllProjects: async () => {
    return apiFetch('/projects', {
      method: 'GET',
    });
  },

  getProjectById: async (projectId) => {
    return apiFetch(`/projects/${projectId}`, {
      method: 'GET',
      headers: { 'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone },
    });
  },

  getTeamMembers: async (projectId, teamName) => {
    return apiFetch(`/${projectId}/teams/${encodeURIComponent(teamName)}/members`, {
      method: 'GET',
      headers: {}, // public endpoint
    });
  },

  getProjectSchedule: async (projectId, dayNumber) => {
    return apiFetch(`/projects/${projectId}/schedule/${dayNumber}`, {
      method: 'GET',
    });
  },

  createProject: async (projectData) => {
    return apiFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  updateProject: async (projectData) => {
    return apiFetch('/projects', {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  deleteProject: async (projectId) => {
    return apiFetch(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Application Endpoints
 */
export const applicationAPI = {
  getApplicationForm: async (projectId) => {
    return apiFetch(`/projects/apply/${projectId}`, {
      method: 'GET',
      headers: {}, // No auth needed for public form
    });
  },

  submitApplication: async (applicationData, files = {}) => {
    const formData = new FormData();
    formData.append('applicationData', JSON.stringify(applicationData));

    // Add file uploads
    Object.entries(files).forEach(([fieldName, file]) => {
      if (file) {
        formData.append(fieldName, file);
      }
    });

    const headers = getHeaders(false); // Don't set Content-Type for FormData
    return apiFetch('/projects/apply', {
      method: 'POST',
      headers,
      body: formData,
    });
  },

  getMyApplications: async () => {
    return apiFetch('/participant/my-applications', {
      method: 'GET',
    });
  },

  getTeamApplications: async (projectId, userName) => {
    return apiFetch(`/participant/team-applications/${projectId}/${userName}`, {
      method: 'GET',
    });
  },

  getFutureProjects: async () => {
    return apiFetch('/projects/dashboard/future', {
      method: 'GET',
    });
  },
};

/**
 * Dashboard Endpoints (Organizer)
 */
export const dashboardAPI = {
  getParticipants: async (projectId) => {
    return apiFetch(`/${projectId}/participants`, {
      method: 'GET',
    });
  },

  getTeams: async (projectId) => {
    return apiFetch(`/${projectId}/teams`, {
      method: 'GET',
    });
  },

  updateApplicantSelection: async (projectId, applicantId, selected) => {
    return apiFetch(`/${projectId}/applicants/${applicantId}/selection`, {
      method: 'PATCH',
      body: JSON.stringify({ selected }),
    });
  },

  bulkUpdateSelection: async (projectId, applicantIds, selected) => {
    return apiFetch(`/${projectId}/applicants/selection`, {
      method: 'PATCH',
      body: JSON.stringify({ applicantIds, selected }),
    });
  },

  autoCreateTeams: async (projectId) => {
    return apiFetch(`/${projectId}/create-teams`, {
      method: 'POST',
    });
  },
};

/**
 * Team Flow Endpoints
 */
export const teamAPI = {
  getProjectTeams: async (projectId) => {
    return apiFetch(`/api/teams-flow/projects/${projectId}/teams`, {
      method: 'GET',
    });
  },

  createTeam: async (projectId, teamData) => {
    return apiFetch(`/api/teams-flow/projects/${projectId}/teams`, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  },

  applyToTeam: async (projectId, teamId) => {
    return apiFetch(`/api/teams-flow/projects/${projectId}/teams/${teamId}/apply`, {
      method: 'POST',
    });
  },

  decideOnApplication: async (projectId, teamId, userId, decision) => {
    return apiFetch(`/api/teams-flow/projects/${projectId}/teams/${teamId}/applications/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    });
  },

  kickMember: async (projectId, teamId, userId) => {
    return apiFetch(`/api/teams-flow/projects/${projectId}/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  leaveTeam: async (projectId, teamId) => {
    return apiFetch(`/api/teams-flow/projects/${projectId}/teams/${teamId}/leave`, {
      method: 'POST',
    });
  },

  getTeamApplications: async (projectId, teamId) => {
    return apiFetch(`/api/teams-flow/projects/${projectId}/teams/${teamId}/applications`, {
      method: 'GET',
    });
  },
};

export default {
  authAPI,
  projectAPI,
  applicationAPI,
  dashboardAPI,
  teamAPI,
};
