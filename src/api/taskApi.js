import api from './axiosInstance';

// POST   /api/tasks        — body: { title, description, status, dueDate }
export const createTaskApi = (data) => api.post('/tasks', data);

// GET    /api/tasks         — query: ?page=0&status=TODO|IN_PROGRESS|DONE
// Returns: TaskDTO[] (max 10 per page)
export const getMyTasksApi = (page = 0, status = null) => {
  const params = { page };
  if (status) params.status = status;
  return api.get('/tasks', { params });
};

// PUT    /api/tasks/{id}    — body: { title, description, status, dueDate }
export const updateTaskApi = (id, data) => api.put(`/tasks/${id}`, data);

// DELETE /api/tasks/{id}
export const deleteTaskApi = (id) => api.delete(`/tasks/${id}`);

// GET    /api/tasks/stats
// Returns: { totalTasks, todoTasks, inProgressTasks, doneTasks }
export const getUserStatsApi = () => api.get('/tasks/stats');

// GET    /api/tasks/profile
// Returns: { id, name, email }
export const getProfileApi = () => api.get('/tasks/profile');

// PUT    /api/tasks/profile — body: { name, email }
export const updateProfileApi = (data) => api.put('/tasks/profile', data);

// PUT    /api/tasks/change-password — body: { oldPassword, newPassword }
export const changePasswordApi = (data) => api.put('/tasks/change-password', data);
