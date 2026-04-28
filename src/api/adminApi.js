import api from './axiosInstance';

// ──────────────────────────────────────────────
// STATS
// GET /api/admin/stats
// Returns: { totalUsers, totalTasks, todoTasks, inProgressTasks, doneTasks }
// ──────────────────────────────────────────────
export const getAdminStatsApi = () => api.get('/admin/stats');

// ──────────────────────────────────────────────
// USERS
// GET  /api/admin/users           → UserDTO[]  { id, name, email }
// DEL  /api/admin/users/{id}
// ──────────────────────────────────────────────
export const getAllUsersApi    = ()     => api.get('/admin/users');
export const deleteUserApi     = (id)   => api.delete(`/admin/users/${id}`);

// ──────────────────────────────────────────────
// TASKS (admin-scoped — all users)
// GET  /api/admin/tasks  ?status=&page=&size=
// PUT  /api/admin/tasks/{id}  body: { title, description, status, dueDate }
// DEL  /api/admin/tasks/{id}
// ──────────────────────────────────────────────
export const getAllTasksAdminApi = (page = 0, size = 10, status = null) => {
  const params = { page, size };
  if (status) params.status = status;
  return api.get('/admin/tasks', { params });
};

export const updateTaskAdminApi = (id, data) => api.put(`/admin/tasks/${id}`, data);
export const deleteTaskAdminApi = (id)        => api.delete(`/admin/tasks/${id}`);

// ──────────────────────────────────────────────
// TASKS — filtered by userId (client-side filter on /api/admin/tasks)
// The backend doesn't expose /admin/tasks?userId= but we can fetch all
// tasks and client-filter, OR use a large page with userId search.
// We expose a helper that fetches all tasks for a given user by paging
// through results and filtering — kept simple: single large page.
// ──────────────────────────────────────────────
export const getTasksByUserAdminApi = (userId, page = 0, size = 20) =>
  api.get('/admin/tasks', { params: { page, size } }).then((res) => {
    // filter client-side since backend doesn't support userId query param
    const content = (res.data?.content || []).filter(
      (t) => t.user?.id === userId
    );
    return {
      ...res,
      data: {
        ...res.data,
        content,
        totalElements: content.length,
      },
    };
  });
