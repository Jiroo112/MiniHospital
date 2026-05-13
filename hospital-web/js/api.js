function apiCall(endpoint, method, data) {
    const token = localStorage.getItem('token');

    const config = {
        url: BASE_URL + endpoint,
        method: method || 'GET',
        contentType: 'application/json',
        dataType: 'json'
    };

    if (token) {
        config.headers = { 'Authorization': 'Bearer ' + token };
    }

    if (data) {
        config.data = JSON.stringify(data);
    }

    return $.ajax(config).fail(function(xhr) {
        if (xhr.status === 401) {
            const message = xhr.responseJSON?.message || 'Sesi habis';
            alert(message + '. Silakan login ulang.');
            localStorage.clear();
            window.location.href = '/MiniHospital/hospital-web/views/auth/login.html';
        }
    });
}