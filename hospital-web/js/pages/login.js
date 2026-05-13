// Logic untuk halaman login

$(function() {
    // Kalau sudah login, langsung redirect
    if (isLoggedIn()) {
        redirectByRole(getUser().role);
        return;
    }

    $('#formLogin').on('submit', handleLogin);
});

function handleLogin(e) {
    e.preventDefault();

    const $btn = $('#btnLogin');
    $btn.prop('disabled', true).text('Memproses...');
    $('#alert-box').empty();

    const data = {
        email: $('input[name=email]').val(),
        password: $('input[name=password]').val()
    };

    apiCall('/auth/login', 'POST', data)
        .done(handleLoginSuccess)
        .fail(handleLoginError);
}

function handleLoginSuccess(res) {
    if (res.status) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        redirectByRole(res.data.user.role);
    }
}

function handleLoginError(xhr) {
    const msg = xhr.responseJSON?.message || 'Login gagal';
    $('#alert-box').html(`<div class="alert alert-danger">${msg}</div>`);
    $('#btnLogin').prop('disabled', false).text('Masuk');
}