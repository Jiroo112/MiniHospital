function getUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

function getToken() {
    return localStorage.getItem('token');
}

function isLoggedIn() {
    return !!getToken();
}

function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = '/MiniHospital/hospital-web/views/auth/login.html';
    }
}

function requireRole(role) {
    requireLogin();
    const user = getUser();
    if (!user || user.role !== role) {
        alert('Akses ditolak. Anda akan diarahkan ke halaman login.');
        localStorage.clear();
        window.location.href = '/MiniHospital/hospital-web/views/auth/login.html';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/MiniHospital/hospital-web/views/auth/login.html';
}

function redirectByRole(role) {
    const base = '/MiniHospital/hospital-web/views/';
    if (role === 'admin')  window.location.href = base + 'admin/dashboard.html';
    if (role === 'dokter') window.location.href = base + 'dokter/dashboard.html';
    if (role === 'pasien') window.location.href = base + 'pasien/dashboard.html';
}