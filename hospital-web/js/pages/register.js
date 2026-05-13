$(function() {
    // Kalau sudah login, redirect ke dashboard
    if (isLoggedIn()) {
        redirectByRole(getUser().role);
        return;
    }

    $('#formRegister').on('submit', handleRegister);
});

function handleRegister(e) {
    e.preventDefault();

    const $btn = $('#btnRegister');
    $btn.prop('disabled', true).text('Memproses...');
    $('#alert-box').empty();

    // Cek konfirmasi password
    const password = $('input[name=password]').val();
    const confirm  = $('input[name=password_confirm]').val();

    if (password !== confirm) {
        $('#alert-box').html('<div class="alert alert-danger">Konfirmasi password tidak cocok</div>');
        $btn.prop('disabled', false).text('Daftar');
        return;
    }

    const data = {
        name:          $('input[name=name]').val(),
        email:         $('input[name=email]').val(),
        password:      password,
        alamat:        $('input[name=alamat]').val(),
        tanggal_lahir: $('input[name=tanggal_lahir]').val()
    };

    apiCall('/auth/register', 'POST', data)
        .done(function(res) {
            if (res.status) {
                $('#alert-box').html(`<div class="alert alert-success">
                    ${res.message} Mengalihkan ke halaman login...
                </div>`);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Registrasi gagal';
            $('#alert-box').html(`<div class="alert alert-danger">${msg}</div>`);
            $btn.prop('disabled', false).text('Daftar');
        });
}