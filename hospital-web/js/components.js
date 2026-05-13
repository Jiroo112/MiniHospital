/**
 * Inject navbar berdasarkan role.
 * activePage: key dari menu yang sedang aktif (untuk highlight)
 */
function injectNavbar(role, activePage = '') {
    const config = {
        admin: {
            color: 'bg-primary',
            label: 'Admin',
            base:  '/MiniHospital/hospital-web/views/admin/',
            menu: [
                { href: 'dashboard.html', label: 'Dashboard', key: 'dashboard' },
                { href: 'poli.html',      label: 'Poli',      key: 'poli' },
                { href: 'doctors.html',   label: 'Dokter',    key: 'doctors' },
                { href: 'schedules.html', label: 'Jadwal',    key: 'schedules' },
                { href: 'queues.html',    label: 'Antrian',   key: 'queues' }
            ]
        },
        dokter: {
            color: 'bg-success',
            label: 'Dokter',
            base:  '/MiniHospital/hospital-web/views/dokter/',
            menu: [
                { href: 'dashboard.html',    label: 'Dashboard',   key: 'dashboard' },
                { href: 'antrian.html',      label: 'Antrian',     key: 'antrian' },
                { href: 'rekam-medis.html',  label: 'Rekam Medis', key: 'rekam' }
            ]
        },
        pasien: {
            color: 'bg-info',
            label: 'Pasien',
            base:  '/MiniHospital/hospital-web/views/pasien/',
            menu: [
                { href: 'dashboard.html', label: 'Dashboard', key: 'dashboard' },
                { href: 'booking.html',   label: 'Booking',   key: 'booking' },
                { href: 'antrian.html',   label: 'Antrian',   key: 'antrian' },
                { href: 'riwayat.html',   label: 'Riwayat',   key: 'riwayat' }
            ]
        }
    };

    const c = config[role];
    if (!c) return;

    const menuHtml = c.menu.map(item => {
        const activeClass = item.key === activePage ? 'fw-bold text-warning' : 'text-white';
        return `<a class="nav-link ${activeClass} px-3" href="${c.base}${item.href}">${item.label}</a>`;
    }).join('');

    const html = `
        <nav class="navbar navbar-dark ${c.color} mb-4">
            <div class="container-fluid px-4">
                <span class="navbar-brand">Mini Hospital — ${c.label}</span>
                <div class="d-flex">${menuHtml}</div>
                <div class="d-flex align-items-center">
                    <span class="text-white me-3" id="navUserName"></span>
                    <button class="btn btn-light btn-sm" onclick="logout()">Logout</button>
                </div>
            </div>
        </nav>
    `;

    $('#navbar').html(html);
    $('#navUserName').text(getUser()?.name || '');
}

/**
 * Helper untuk munculkan alert flash di area tertentu.
 */
function showAlert(target, type, message) {
    const html = `<div class="alert alert-${type} alert-dismissible fade show">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
    $(target).html(html);
}