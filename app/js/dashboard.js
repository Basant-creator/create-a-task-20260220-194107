document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your backend runs on a different port/host
    let currentTaskEditingId = null;
    let currentFilter = 'all';

    const userGreeting = document.getElementById('user-greeting');
    const userEmail = document.getElementById('user-email');
    const totalTasksDisplay = document.getElementById('total-tasks');
    const pendingTasksDisplay = document.getElementById('pending-tasks');
    const completedTasksDisplay = document.getElementById('completed-tasks');
    const taskList = document.getElementById('task-list');
    const noTasksMessage = document.querySelector('.no-tasks');

    const addTaskBtn = document.getElementById('add-task-btn');
    const taskModal = document.getElementById('task-modal');
    const closeButton = document.querySelector('.modal .close-button');
    const taskForm = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');
    const saveTaskButton = document.getElementById('save-task-button');

    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskCompletedInput = document.getElementById('task-completed');
    const taskTitleError = document.getElementById('task-title-error');
    const taskFormError = document.getElementById('task-form-error');

    const filterButtons = document.querySelectorAll('.task-filters .btn');

    // Profile and Settings page elements (re-using dashboard.js)
    const profileForm = document.getElementById('profile-form');
    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
    const profileBioInput = document.getElementById('profile-bio');
    const profileSuccessMsg = document.getElementById('profile-success');
    const profileFormError = document.getElementById('profile-form-error');
    const saveProfileButton = document.getElementById('save-profile-button');
    const profilePictureInput = document.getElementById('profile-picture');
    const profilePicturePreview = document.getElementById('profile-picture-preview');

    const passwordForm = document.getElementById('password-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const passwordSuccessMsg = document.getElementById('password-success');
    const passwordFormError = document.getElementById('password-form-error');
    const changePasswordButton = document.getElementById('change-password-button');

    const generalSettingsForm = document.getElementById('general-settings-form');
    const securitySettingsForm = document.getElementById('security-settings-form');
    const deleteAccountButton = document.getElementById('delete-account-button');

    // --- Authentication Check & Token Retrieval ---
    function getToken() {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    }

    function isAuthenticated() {
        return !!getToken();
    }

    function redirectToLogin() {
        window.location.href = '../public/login.html';
    }

    // --- Logout Function ---
    function handleLogout() {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        redirectToLogin();
    }

    const logoutButtons = document.querySelectorAll('#logout-button, #sidebar-logout-button');
    logoutButtons.forEach(btn => {
        if (btn) btn.addEventListener('click', handleLogout);
    });

    // Initial check for authentication
    if (!isAuthenticated()) {
        redirectToLogin();
        return; // Stop further execution if not authenticated
    }

    // --- Helper for UI Feedback ---
    function showMessage(element, message, isError = false) {
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = isError ? '#ef4444' : '#22c55e';
    }

    function clearMessages(elementIds) {
        elementIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = '';
                el.style.display = 'none';
            }
        });
    }

    function setLoading(button, isLoading) {
        const spinner = button.querySelector('.spinner');
        if (isLoading) {
            button.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';
            button.classList.add('loading');
        } else {
            button.disabled = false;
            if (spinner) spinner.style.display = 'none';
            button.classList.remove('loading');
        }
    }


    // --- Fetch User Data (common for dashboard/profile/settings) ---
    async function fetchUserData() {
        const token = getToken();
        if (!token) {
            redirectToLogin();
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const user = data.data;
                if (userGreeting) userGreeting.textContent = `Hello, ${user.name || user.email.split('@')[0]}!`;
                if (userEmail) userEmail.textContent = user.email;

                // For Profile page
                if (profileNameInput) profileNameInput.value = user.name || '';
                if (profileEmailInput) profileEmailInput.value = user.email;
                if (profileBioInput) profileBioInput.value = user.bio || '';

            } else {
                console.error('Failed to fetch user data:', data.message);
                handleLogout(); // Log out if token is invalid
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            handleLogout();
        }
    }

    // --- Task Management Functions ---
    async function fetchTasks() {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/tasks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok && data.success) {
                displayTasks(data.data);
                updateTaskStats(data.data);
            } else {
                console.error('Failed to fetch tasks:', data.message);
                taskList.innerHTML = `<p class="error-message">Error loading tasks: ${data.message}</p>`;
                noTasksMessage.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            taskList.innerHTML = `<p class="error-message">An unexpected error occurred while loading tasks.</p>`;
            noTasksMessage.style.display = 'none';
        }
    }

    function updateTaskStats(tasks) {
        if (!totalTasksDisplay || !pendingTasksDisplay || !completedTasksDisplay) return;

        totalTasksDisplay.textContent = tasks.length;
        pendingTasksDisplay.textContent = tasks.filter(task => !task.completed).length;
        completedTasksDisplay.textContent = tasks.filter(task => task.completed).length;
    }

    function displayTasks(tasks) {
        if (!taskList) return;

        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all' filter
        });

        if (filteredTasks.length === 0) {
            noTasksMessage.style.display = 'block';
            return;
        } else {
            noTasksMessage.style.display = 'none';
        }

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task._id;

            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date';

            taskItem.innerHTML = `
                <div class="task-info">
                    <label class="task-checkbox-container">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-completed-checkbox">
                        <span class="task-checkmark"></span>
                    </label>
                    <div class="task-title-and-details">
                        <h4>${task.title}</h4>
                        <div class="task-details-row">
                            <span><i class="fas fa-calendar-alt"></i> ${dueDate}</span>
                            <span><i class="fas fa-flag"></i> Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" title="Edit Task"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });

        // Add event listeners for new tasks
        taskList.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.id;
                openTaskModalForEdit(taskId);
            });
        });

        taskList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.id;
                deleteTask(taskId);
            });
        });

        taskList.querySelectorAll('.task-completed-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.closest('.task-item').dataset.id;
                toggleTaskCompleted(taskId, e.target.checked);
            });
        });
    }

    // --- Task Modal Handlers ---
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            openTaskModalForAdd();
        });
    }
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            taskModal.classList.remove('active');
        });
    }
    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            taskModal.classList.remove('active');
        }
    });

    function openTaskModalForAdd() {
        clearMessages(['task-title-error', 'task-form-error']);
        taskForm.reset();
        modalTitle.textContent = 'Add New Task';
        currentTaskEditingId = null;
        taskCompletedInput.parentElement.style.display = 'none'; // Hide completed checkbox for new tasks
        taskModal.classList.add('active');
    }

    async function openTaskModalForEdit(taskId) {
        clearMessages(['task-title-error', 'task-form-error']);
        taskForm.reset();
        modalTitle.textContent = 'Edit Task';
        currentTaskEditingId = taskId;
        taskCompletedInput.parentElement.style.display = 'block'; // Show completed checkbox for editing

        const token = getToken();
        try {
            const response = await fetch(`${API_BASE_URL}/users/tasks/${taskId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok && data.success) {
                const task = data.data;
                taskTitleInput.value = task.title;
                taskDescriptionInput.value = task.description || '';
                taskDueDateInput.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
                taskPriorityInput.value = task.priority || 'medium';
                taskCompletedInput.checked = task.completed;
                taskModal.classList.add('active');
            } else {
                showMessage(taskFormError, data.message || 'Failed to load task for editing.', true);
            }
        } catch (error) {
            console.error('Error loading task:', error);
            showMessage(taskFormError, 'An error occurred while loading the task.', true);
        }
    }

    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages(['task-title-error', 'task-form-error']);
            setLoading(saveTaskButton, true);

            const title = taskTitleInput.value.trim();
            const description = taskDescriptionInput.value.trim();
            const dueDate = taskDueDateInput.value;
            const priority = taskPriorityInput.value;
            const completed = taskCompletedInput.checked;

            if (!title) {
                showMessage(taskTitleError, 'Task title is required.', true);
                setLoading(saveTaskButton, false);
                return;
            }

            const taskData = { title, description, dueDate, priority, completed };
            const token = getToken();
            let url = `${API_BASE_URL}/users/tasks`;
            let method = 'POST';

            if (currentTaskEditingId) {
                url = `${API_BASE_URL}/users/tasks/${currentTaskEditingId}`;
                method = 'PUT';
            }

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(taskData),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    taskModal.classList.remove('active');
                    await fetchTasks(); // Refresh tasks
                } else {
                    showMessage(taskFormError, data.message || `Failed to ${currentTaskEditingId ? 'update' : 'add'} task.`, true);
                }
            } catch (error) {
                console.error('Task form submission error:', error);
                showMessage(taskFormError, 'An unexpected error occurred.', true);
            } finally {
                setLoading(saveTaskButton, false);
            }
        });
    }

    async function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        const token = getToken();
        try {
            const response = await fetch(`${API_BASE_URL}/users/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchTasks(); // Refresh tasks
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete task.');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('An unexpected error occurred while deleting the task.');
        }
    }

    async function toggleTaskCompleted(taskId, completedStatus) {
        const token = getToken();
        try {
            const response = await fetch(`${API_BASE_URL}/users/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed: completedStatus })
            });

            if (response.ok) {
                await fetchTasks(); // Refresh tasks
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update task status.');
            }
        } catch (error) {
            console.error('Error toggling task completed status:', error);
            alert('An unexpected error occurred while updating task status.');
        }
    }

    // --- Task Filters ---
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.filter;
                fetchTasks(); // Re-fetch or re-display tasks with new filter
            });
        });
    }


    // --- Profile Form Handling ---
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages(['profile-success', 'profile-form-error']);
            setLoading(saveProfileButton, true);

            const name = profileNameInput.value.trim();
            const bio = profileBioInput.value.trim();
            // Email is disabled and not sent for update via this form

            const userData = { name, bio }; // Profile picture upload would need FormData

            const token = getToken();
            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, { // Using /users/profile or /users/:id
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(userData),
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showMessage(profileSuccessMsg, 'Profile updated successfully!');
                    fetchUserData(); // Refresh user info in sidebar
                } else {
                    showMessage(profileFormError, data.message || 'Failed to update profile.', true);
                }
            } catch (error) {
                console.error('Profile update error:', error);
                showMessage(profileFormError, 'An unexpected error occurred.', true);
            } finally {
                setLoading(saveProfileButton, false);
            }
        });

        if (profilePictureInput) {
            profilePictureInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        profilePicturePreview.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                    // In a real app, you'd send this file to a /users/upload-avatar endpoint
                    // For now, it's just a client-side preview.
                }
            });
        }
    }

    // --- Password Form Handling ---
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages(['password-success', 'password-form-error', 'current-password-error', 'new-password-error', 'confirm-new-password-error']);
            setLoading(changePasswordButton, true);

            const currentPassword = currentPasswordInput.value.trim();
            const newPassword = newPasswordInput.value.trim();
            const confirmNewPassword = confirmNewPasswordInput.value.trim();

            let valid = true;
            if (!currentPassword) {
                showMessage(document.getElementById('current-password-error'), 'Current password is required.', true);
                valid = false;
            }
            if (!newPassword) {
                showMessage(document.getElementById('new-password-error'), 'New password is required.', true);
                valid = false;
            } else if (newPassword.length < 6) {
                showMessage(document.getElementById('new-password-error'), 'New password must be at least 6 characters.', true);
                valid = false;
            }
            if (!confirmNewPassword) {
                showMessage(document.getElementById('confirm-new-password-error'), 'Confirm new password is required.', true);
                valid = false;
            } else if (newPassword !== confirmNewPassword) {
                showMessage(document.getElementById('confirm-new-password-error'), 'New passwords do not match.', true);
                valid = false;
            }

            if (!valid) {
                setLoading(changePasswordButton, false);
                return;
            }

            const passwordData = { currentPassword, newPassword };
            const token = getToken();

            try {
                const response = await fetch(`${API_BASE_URL}/users/change-password`, { // New endpoint for password change
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(passwordData),
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showMessage(passwordSuccessMsg, 'Password changed successfully!');
                    passwordForm.reset();
                } else {
                    showMessage(passwordFormError, data.message || 'Failed to change password.', true);
                }
            } catch (error) {
                console.error('Password change error:', error);
                showMessage(passwordFormError, 'An unexpected error occurred.', true);
            } finally {
                setLoading(changePasswordButton, false);
            }
        });
    }

    // --- Settings Forms Handling ---
    if (generalSettingsForm) {
        generalSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages(['general-success', 'general-form-error']);
            setLoading(document.getElementById('save-general-settings-button'), true);

            const emailNotifications = document.getElementById('email-notifications').checked;
            const pushNotifications = document.getElementById('push-notifications').checked;
            const defaultView = document.getElementById('default-view').value;

            const settingsData = { emailNotifications, pushNotifications, defaultView };
            const token = getToken();

            try {
                const response = await fetch(`${API_BASE_URL}/users/settings/general`, { // Example endpoint
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(settingsData),
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showMessage(document.getElementById('general-success'), 'General settings saved!');
                } else {
                    showMessage(document.getElementById('general-form-error'), data.message || 'Failed to save general settings.', true);
                }
            } catch (error) {
                console.error('General settings error:', error);
                showMessage(document.getElementById('general-form-error'), 'An unexpected error occurred.', true);
            } finally {
                setLoading(document.getElementById('save-general-settings-button'), false);
            }
        });
    }

    if (securitySettingsForm) {
        securitySettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages(['security-success', 'security-form-error']);
            setLoading(document.getElementById('save-security-settings-button'), true);

            const twoFactorAuth = document.getElementById('two-factor-auth').checked;
            const sessionTimeout = document.getElementById('session-timeout').checked;

            const securityData = { twoFactorAuth, sessionTimeout };
            const token = getToken();

            try {
                const response = await fetch(`${API_BASE_URL}/users/settings/security`, { // Example endpoint
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(securityData),
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showMessage(document.getElementById('security-success'), 'Security settings saved!');
                } else {
                    showMessage(document.getElementById('security-form-error'), data.message || 'Failed to save security settings.', true);
                }
            } catch (error) {
                console.error('Security settings error:', error);
                showMessage(document.getElementById('security-form-error'), 'An unexpected error occurred.', true);
            } finally {
                setLoading(document.getElementById('save-security-settings-button'), false);
            }
        });
    }

    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', async () => {
            if (!confirm('WARNING: Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                return;
            }
            // In a real application, you might add another confirmation step,
            // or require password re-entry for this sensitive action.

            const token = getToken();
            try {
                const response = await fetch(`${API_BASE_URL}/users/delete-account`, { // Example endpoint
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    alert('Your account has been successfully deleted.');
                    handleLogout(); // Log out and redirect after deletion
                } else {
                    const data = await response.json();
                    alert(data.message || 'Failed to delete account.');
                }
            } catch (error) {
                console.error('Delete account error:', error);
                alert('An unexpected error occurred while deleting your account.');
            }
        });
    }


    // --- Initialize Dashboard ---
    if (document.querySelector('.dashboard-content')) { // Only run if on dashboard page
        fetchUserData();
        fetchTasks();
    } else if (document.querySelector('.profile-content') || document.querySelector('.settings-content')) { // Run for profile/settings pages
        fetchUserData();
    }
});