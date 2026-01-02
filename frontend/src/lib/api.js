const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    throw new ApiError(
      data?.detail || 'An error occurred',
      response.status,
      data
    );
  }
  
  return data;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(response);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Dashboard
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  // Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
  
  // Courses
  getCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  createCourse: async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return handleResponse(response);
  },
  
  updateCourse: async (courseId, courseData) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return handleResponse(response);
  },
  
  deleteCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  // Tee Times
  getTeeTimes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/tee-times${queryString ? `?${queryString}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  createTeeTime: async (teeTimeData) => {
    const response = await fetch(`${API_BASE_URL}/api/tee-times`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(teeTimeData),
    });
    return handleResponse(response);
  },
  
  updateTeeTime: async (teeTimeId, teeTimeData) => {
    const response = await fetch(`${API_BASE_URL}/api/tee-times/${teeTimeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(teeTimeData),
    });
    return handleResponse(response);
  },
  
  deleteTeeTime: async (teeTimeId) => {
    const response = await fetch(`${API_BASE_URL}/api/tee-times/${teeTimeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  // Bookings
  getBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  // Competitions
  getCompetitions: async () => {
    const response = await fetch(`${API_BASE_URL}/api/competitions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  createCompetition: async (competitionData) => {
    const response = await fetch(`${API_BASE_URL}/api/competitions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(competitionData),
    });
    return handleResponse(response);
  },
  
  updateCompetition: async (competitionId, competitionData) => {
    const response = await fetch(`${API_BASE_URL}/api/competitions/${competitionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(competitionData),
    });
    return handleResponse(response);
  },
  
  deleteCompetition: async (competitionId) => {
    const response = await fetch(`${API_BASE_URL}/api/competitions/${competitionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export { ApiError };
