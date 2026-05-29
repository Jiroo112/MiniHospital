const NAV_MENU = [
    { href: 'dashboard.html', label: 'Dashboard',  key: 'dashboard', icon: 'bi-speedometer2' },
    { href: 'poli.html',      label: 'Poli',        key: 'poli',      icon: 'bi-building-fill-cross' },
    { href: 'doctors.html',   label: 'Dokter',      key: 'doctors',   icon: 'bi-person-badge' },
    { href: 'schedules.html', label: 'Jadwal',      key: 'schedules', icon: 'bi-calendar-week' },
    { href: 'queues.html',    label: 'Antrian',     key: 'queues',    icon: 'bi-list-ol' }
];
const BASE_PATH   = '/MiniHospital/hospital-web/views/admin/';
const ACTIVE_PAGE = 'poli';

function buildNav() {
    document.getElementById('navLinks').innerHTML = NAV_MENU.map(m => {
        const active = m.key === ACTIVE_PAGE ? 'active' : '';
        return `<a href="${BASE_PATH}${m.href}" class="${active}"><i class="bi ${m.icon} me-1"></i>${m.label}</a>`;
    }).join('');
}

function setUserInfo() {
    const u = getUser(); if (!u) return;
    document.getElementById('navUserName').textContent = u.name;
    document.getElementById('navAvatar').textContent =
        (u.name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'A').substring(0, 2);
}

function showAlert(type, msg) {
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
    document.getElementById('alertBox').innerHTML =
        `<div class="mh-alert ${type}"><i class="bi ${icon}"></i>${msg}</div>`;
    setTimeout(() => document.getElementById('alertBox').innerHTML = '', 4000);
}

requireRole('admin');
buildNav();
setUserInfo();

const POLI_ICONS = [
    'bi-heart-pulse', 'bi-eye', 'bi-lungs', 'bi-capsule',
    'bi-person-arms-up', 'bi-droplet-half', 'bi-bandaid',
    'bi-clipboard2-pulse', 'bi-thermometer-half'
];

function loadPoli() {
    apiCall('/poli', 'GET').done(function(res) {
        if (!res.data || !res.data.length) {
            document.getElementById('poliGrid').innerHTML =
                `<div class="empty-state" style="grid-column:1/-1"><i class="bi bi-building-fill-cross"></i><p>Belum ada data poli</p></div>`;
            return;
        }
        document.getElementById('poliGrid').innerHTML = res.data.map((p, i) => `
            <div class="poli-card" data-name="${p.nama_poli.toLowerCase()}">
                <div class="poli-card-icon"><i class="bi ${POLI_ICONS[i % POLI_ICONS.length]}"></i></div>
                <div class="poli-card-name">${p.nama_poli}</div>
                <div class="poli-card-loc"><i class="bi bi-geo-alt"></i>${p.lokasi || 'Lokasi belum diatur'}</div>
                <div class="poli-card-actions">
                    <button class="btn-action btn-edit" onclick="openEditModal(${p.id})"><i class="bi bi-pencil"></i> Edit</button>
                    <button class="btn-action btn-del" onclick="hapusPoli(${p.id},'${p.nama_poli}')"><i class="bi bi-trash"></i> Hapus</button>
                </div>
            </div>`).join('');
    });
}

function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Tambah Poli';
    document.getElementById('formPoli').reset();
    document.querySelector('input[name=id]').value = '';
    new bootstrap.Modal(document.getElementById('poliModal')).show();
}

function openEditModal(id) {
    apiCall(`/poli/${id}`, 'GET').done(function(res) {
        if (!res.status || !res.data) return;
        document.getElementById('modalTitle').textContent = 'Edit Poli';
        document.querySelector('input[name=id]').value       = res.data.id;
        document.querySelector('input[name=nama_poli]').value = res.data.nama_poli;
        document.querySelector('input[name=lokasi]').value   = res.data.lokasi || '';
        new bootstrap.Modal(document.getElementById('poliModal')).show();
    });
}

function hapusPoli(id, nama) {
    if (!confirm(`Yakin hapus poli "${nama}"?`)) return;
    apiCall(`/poli/${id}`, 'DELETE')
        .done(res => { showAlert('success', res.message); loadPoli(); })
        .fail(xhr => showAlert('error', xhr.responseJSON?.message || 'Gagal menghapus'));
}

document.getElementById('btnTambah').onclick = openCreateModal;

document.getElementById('formPoli').onsubmit = function(e) {
    e.preventDefault();
    const id   = document.querySelector('input[name=id]').value;
    const data = {
        nama_poli: document.querySelector('input[name=nama_poli]').value,
        lokasi:    document.querySelector('input[name=lokasi]').value
    };
    apiCall(id ? `/poli/${id}` : '/poli', id ? 'PUT' : 'POST', data)
        .done(res => {
            bootstrap.Modal.getInstance(document.getElementById('poliModal')).hide();
            showAlert('success', res.message);
            loadPoli();
        })
        .fail(xhr => showAlert('error', xhr.responseJSON?.message || 'Gagal menyimpan'));
};

document.getElementById('searchInput').oninput = function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('.poli-card').forEach(c => {
        c.style.display = c.dataset.name.includes(q) ? '' : 'none';
    });
};

loadPoli();
