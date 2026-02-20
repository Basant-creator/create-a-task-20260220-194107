document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const formErrorDisplay = document.getElementById('form-error');
    
    // Base URL for API calls
    const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your backend runs on a different port/host

    // Helper function to show errors
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Helper function to clear errors
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message, .auth-error-display');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    // Helper function for loading state
    function setLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        const spinner = button.querySelector('.spinner');
        if (isLoading) {
            button.disabled = true;
            spinner.style.display = 'inline-block';
            button.classList.add('loading');
        } else {
            button.disabled = false;
            spinner.style.display = 'none';
            button.classList.remove('loading');
        }
    }

    // --- Login Form Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();
            setLoading('login-button', true);

            const email = loginForm.email.value.trim();
            const password = loginForm.password.value.trim();
            const rememberMe = loginForm['remember-me'].checked;

            let valid = true;
            if (!email) {
                showError('email-error', 'Email is required.');
                valid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                showError('email-error', 'Email is not valid.');
                valid = false;
            }
            if (!password) {
                showError('password-error', 'Password is required.');
                valid = false;
            }

            if (!valid) {
                setLoading('login-button', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Store token in localStorage
                    if (rememberMe) {
                        localStorage.setItem('token', data.data.token);
                    } else {
                        sessionStorage.setItem('token', data.data.token); // Use sessionStorage for non-persistent login
                    }
                    // Redirect to dashboard
                    window.location.href = 'app/dashboard.html';
                } else {
                    showError('form-error', data.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('form-error', 'An unexpected error occurred. Please try again.');
            } finally {
                setLoading('login-button', false);
            }
        });
    }

    // --- Signup Form Logic ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();
            setLoading('signup-button', true);

            const email = signupForm.email.value.trim();
            const password = signupForm.password.value.trim();
            const confirmPassword = signupForm['confirm-password'].value.trim();
            const termsAccepted = signupForm.terms.checked;

            let valid = true;
            if (!email) {
                showError('email-error', 'Email is required.');
                valid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                showError('email-error', 'Email is not valid.');
                valid = false;
            }
            if (!password) {
                showError('password-error', 'Password is required.');
                valid = false;
            } else if (password.length < 6) {
                showError('password-error', 'Password must be at least 6 characters.');
                valid = false;
            }
            if (!confirmPassword) {
                showError('confirm-password-error', 'Confirm password is required.');
                valid = false;
            } else if (password !== confirmPassword) {
                showError('confirm-password-error', 'Passwords do not match.');
                valid = false;
            }
            if (!termsAccepted) {
                showError('terms-error', 'You must accept the terms and conditions.');
                valid = false;
            }

            if (!valid) {
                setLoading('signup-button', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('token', data.data.token);
                    // Redirect to dashboard after successful signup
                    window.location.href = 'app/dashboard.html';
                } else {
                    showError('form-error', data.message || 'Signup failed. Please try again.');
                }
            } catch (error) {
                console.error('Signup error:', error);
                showError('form-error', 'An unexpected error occurred. Please try again.');
            } finally {
                setLoading('signup-button', false);
            }
        });
    }
});