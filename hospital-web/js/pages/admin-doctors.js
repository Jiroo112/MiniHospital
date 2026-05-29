const NAV_MENU = [
    { href: 'dashboard.html', label: 'Dashboard',  key: 'dashboard', icon: 'bi-speedometer2' },
    { href: 'poli.html',      label: 'Poli',        key: 'poli',      icon: 'bi-building-fill-cross' },
    { href: 'doctors.html',   label: 'Dokter',      key: 'doctors',   icon: 'bi-person-badge' },
    { href: 'schedules.html', label: 'Jadwal',      key: 'schedules', icon: 'bi-calendar-week' },
    { href: 'queues.html',    label: 'Antrian',     key: 'queues',    icon: 'bi-list-ol' }
];
const BASE_PATH   = '/MiniHospital/hospital-web/views/admin/';
const ACTIVE_PAGE = 'doctors';

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

function loadDoctors() {
    document.getElementById('tableBody').innerHTML =
        '<tr><td colspan="6" class="text-center py-4" style="color:var(--text-muted)">Memuat...</td></tr>';

    apiCall('/doctors', 'GET').done(function(res) {
        if (!res.data || !res.data.length) {
            document.getElementById('tableBody').innerHTML =
                `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-person-badge"></i><p>Belum ada data dokter</p></div></td></tr>`;
            return;
        }

        document.getElementById('tableBody').innerHTML = res.data.map((d, i) => {
            const initials = d.nama?.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) || '?';
            return `
            <tr>
                <td style="color:var(--text-muted);font-weight:600">${i + 1}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="doc-avatar">${initials}</div>
                        <div>
                            <div class="doc-name">${d.nama}</div>
                            <div class="doc-email">${d.email}</div>
                        </div>
                    </div>
                </td>
                <td><span class="spec-badge">${d.spesialis || 'Umum'}</span></td>
                <td><span class="poli-badge">${d.poli?.nama_poli || '-'}</span></td>
                <td style="color:var(--text-secondary)">${d.no_hp || '-'}</td>
                <td>
                    <button class="btn-action btn-edit me-1" onclick="openEditModal(${d.id})"><i class="bi bi-pencil"></i> Edit</button>
                    <button class="btn-action btn-del" onclick="hapusDoctor(${d.id},'${d.nama}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    });
}

function loadPoliOptions() {
    apiCall('/poli', 'GET').done(function(res) {
        if (!res.data) return;
        const opts = ['<option value="">-- Pilih Poli --</option>']
            .concat(res.data.map(p => `<option value="${p.id}">${p.nama_poli}</option>`))
            .join('');
        document.querySelector('select[name=poli_id]').innerHTML = opts;
    });
}

function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Tambah Dokter';
    document.getElementById('formDoctor').reset();
    document.querySelector('input[name=id]').value = '';
    document.getElementById('passwordGroup').style.display = '';
    document.querySelector('input[name=password]').required = true;
    document.querySelector('input[name=email]').readOnly = false;
    new bootstrap.Modal(document.getElementById('doctorModal')).show();
}

function openEditModal(id) {
    apiCall(`/doctors/${id}`, 'GET').done(function(res) {
        if (!res.status || !res.data) return;
        document.getElementById('modalTitle').textContent = 'Edit Dokter';
        document.querySelector('input[name=id]').value       = res.data.id;
        document.querySelector('input[name=name]').value     = res.data.nama;
        document.querySelector('input[name=email]').value    = res.data.email;
        document.querySelector('input[name=spesialis]').value = res.data.spesialis || '';
        document.querySelector('input[name=no_hp]').value    = res.data.no_hp || '';
        document.querySelector('select[name=poli_id]').value = res.data.poli_id;
        document.getElementById('passwordGroup').style.display = 'none';
        document.querySelector('input[name=password]').required = false;
        document.querySelector('input[name=email]').readOnly = true;
        new bootstrap.Modal(document.getElementById('doctorModal')).show();
    });
}

function hapusDoctor(id, nama) {
    if (!confirm(`Yakin hapus dokter "${nama}"? Akun login dokter ini juga akan ikut terhapus.`)) return;
    apiCall(`/doctors/${id}`, 'DELETE')
        .done(res => { showAlert('success', res.message); loadDoctors(); })
        .fail(xhr => showAlert('error', xhr.responseJSON?.message || 'Gagal menghapus'));
}

document.getElementById('btnTambah').onclick = openCreateModal;

document.getElementById('formDoctor').onsubmit = function(e) {
    e.preventDefault();
    const id   = document.querySelector('input[name=id]').value;
    const data = {
        name:      document.querySelector('input[name=name]').value,
        spesialis: document.querySelector('input[name=spesialis]').value,
        no_hp:     document.querySelector('input[name=no_hp]').value,
        poli_id:   parseInt(document.querySelector('select[name=poli_id]').value)
    };
    if (!id) {
        data.email    = document.querySelector('input[name=email]').value;
        data.password = document.querySelector('input[name=password]').value;
    }
    apiCall(id ? `/doctors/${id}` : '/doctors', id ? 'PUT' : 'POST', data)
        .done(res => {
            bootstrap.Modal.getInstance(document.getElementById('doctorModal')).hide();
            showAlert('success', res.message);
            loadDoctors();
        })
        .fail(xhr => showAlert('error', xhr.responseJSON?.message || 'Gagal menyimpan'));
};

document.getElementById('searchInput').oninput = function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('#tableBody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
};

loadDoctors();
loadPoliOptions();
