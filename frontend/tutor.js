document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    const userNameDisplay = document.getElementById('welcome');

    if (!accessToken) {
        window.location.href = '/login.html';
        return;
    }

    const name = localStorage.getItem('name');
    if (name && userNameDisplay) {
        userNameDisplay.textContent = `Welcome, ${name}`;
    }
});
