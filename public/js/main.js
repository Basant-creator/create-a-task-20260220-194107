document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    const logoutButton = document.getElementById('logout-button');

    // Hamburger menu toggle
    if (hamburger && mainNav) {
        hamburger.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            hamburger.querySelector('i').classList.toggle('fa-bars');
            hamburger.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Function to check authentication status
    function isAuthenticated() {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    }

    // Function to update navigation links based on auth status
    function updateNavLinkVisibility() {
        const loggedIn = isAuthenticated();
        const navLinks = mainNav.querySelectorAll('.nav-link');
        const logoutBtn = mainNav.querySelector('.nav-logout');

        // Hide/show links based on auth status
        navLinks.forEach(link => {
            if (link.classList.contains('nav-login') || link.classList.contains('nav-signup')) {
                link.style.display = loggedIn ? 'none' : 'block';
            } else if (link.classList.contains('nav-dashboard') || link.classList.contains('nav-profile') || link.classList.contains('nav-settings')) {
                link.style.display = loggedIn ? 'block' : 'none';
            }
        });

        if (logoutBtn) {
            logoutBtn.style.display = loggedIn ? 'inline-block' : 'none';
        }
    }

    // Highlight current page
    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const navLinks = mainNav.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.classList.remove('current-page');
            const linkPath = link.getAttribute('href');
            
            // Handle relative paths correctly
            if (currentPath.includes(linkPath)) {
                link.classList.add('current-page');
            }
            // Special handling for index.html as root
            if (currentPath === '/' || currentPath.endsWith('index.html') && link.classList.contains('nav-home')) {
                link.classList.add('current-page');
            }
        });
    }

    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            // Redirect to public homepage
            window.location.href = '../public/index.html'; // For app pages
            // If on public page, window.location.href = 'index.html';
            // A more robust solution would be to use a base path or root resolver.
            // For now, assuming direct navigation from app pages.
        });
    }

    // Initial setup
    updateNavLinkVisibility();
    highlightCurrentPage();
});

// For `app` pages, the logout redirect might need adjustment based on the base path.
// A simple solution to handle logout button click across public/app pages.
// In a more complex app, a global JS file or backend redirect would handle this.
// For now, if logout button is clicked from public pages, it should go to public index.
// If from app pages, it should go to public index.
// The current `main.js` is included on ALL public pages. `dashboard.js` (for app pages) will have the logout logic.
// So, the `logoutButton` event listener here will only be active on public pages.
// I will ensure `app/js/dashboard.js` has its own logout logic.

// To make `main.js` also handle logout on public pages properly.
// If the logout button is clicked on a public page, the redirect should be 'index.html'.
// If on an app page, it should be '../public/index.html'.
// This implies the logout button in the header should probably be handled by a more universal script
// or have separate handlers/paths based on which file includes it.
// For simplicity in this project, I will have the logout functionality primarily handled in `dashboard.js`
// for protected pages, and `main.js` will handle updating nav links for public pages on load.
// The logout button on public pages will naturally redirect to index.html because there's no auth to clear.
// The logout button on app pages will be handled by `app/js/dashboard.js`.