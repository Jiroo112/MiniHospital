const NAV_MENU = [
    { href: 'dashboard.html', label: 'Dashboard',  key: 'dashboard', icon: 'bi-speedometer2' },
    { href: 'poli.html',      label: 'Poli',        key: 'poli',      icon: 'bi-building-fill-cross' },
    { href: 'doctors.html',   label: 'Dokter',      key: 'doctors',   icon: 'bi-person-badge' },
    { href: 'schedules.html', label: 'Jadwal',      key: 'schedules', icon: 'bi-calendar-week' },
    { href: 'queues.html',    label: 'Antrian',     key: 'queues',    icon: 'bi-list-ol' }
];
const BASE_PATH   = '/MiniHospital/hospital-web/views/admin/';
const ACTIVE_PAGE = 'schedules';

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

function loadSchedules() {
    const dokterId = document.getElementById('filterDokter').value;
    const endpoint = dokterId ? `/schedules?dokter_id=${dokterId}` : '/schedules';
    document.getElementById('tableBody').innerHTML =
        `<tr><td colspan="5" class="text-center py-4" style="color:var(--text-muted)">Memuat...</td></tr>`;

    apiCall(endpoint, 'GET').done(function(res) {
        if (!res.data || !res.data.length) {
            document.getElementById('tableBody').innerHTML =
                `<tr><td colspan="5"><div class="empty-state"><i class="bi bi-calendar-x"></i><p>Belum ada jadwal</p></div></td></tr>`;
            return;
        }
        document.getElementById('tableBody').innerHTML = res.data.map((s, i) => `
            <tr>
                <td style="color:var(--text-muted);font-weight:600">${i + 1}</td>
                <td>
                    <div style="font-weight:700">${s.nama_dokter}</div>
                    <div style="font-size:0.78rem;color:var(--text-muted)">${s.spesialis || ''}</div>
                </td>
                <td><span class="day-badge day-${s.hari}"><i class="bi bi-calendar3 me-1"></i>${s.hari}</span></td>
                <td>
                    <div class="time-wrap">
                        <i class="bi bi-clock"></i>
                        ${formatTime(s.jam_mulai)}
                        <span class="time-sep">→</span>
                        ${formatTime(s.jam_selesai)}
                    </div>
                </td>
                <td>
                    <button class="btn-action btn-edit me-1" onclick="openEditModal(${s.id})"><i class="bi bi-pencil"></i> Edit</button>
                    <button class="btn-action btn-del" onclick="hapusSchedule(${s.id})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`).join('');
    });
}

function loadDokterOptions() {
    apiCall('/doctors', 'GET').done(function(res) {
        if (!res.data) return;
        document.getElementById('filterDokter').innerHTML =
            ['<option value="">Semua Dokter</option>']
            .concat(res.data.map(d => `<option value="${d.id}">${d.nama}</option>`))
            .join('');
        document.querySelector('select[name=dokter_id]').innerHTML =
            ['<option value="">-- Pilih Dokter --</option>']
            .concat(res.data.map(d => `<option value="${d.id}">${d.nama}${d.spesialis ? ' (' + d.spesialis + ')' : ''}</option>`))
            .join('');
    });
}

function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Tambah Jadwal';
    document.getElementById('formSchedule').reset();
    document.querySelector('input[name=id]').value = '';
    document.querySelector('select[name=dokter_id]').disabled = false;
    new bootstrap.Modal(document.getElementById('scheduleModal')).show();
}

function openEditModal(id) {
    apiCall(`/schedules/${id}`, 'GET').done(function(res) {
        if (!res.status || !res.data) return;
        document.getElementById('modalTitle').textContent = 'Edit Jadwal';
        document.querySelector('input[name=id]').value          = res.data.id;
        document.querySelector('select[name=dokter_id]').value  = res.data.dokter_id;
        document.querySelector('select[name=dokter_id]').disabled = true;
        document.querySelector('select[name=hari]').value       = res.data.hari;
        document.querySelector('input[name=jam_mulai]').value   = formatTime(res.data.jam_mulai);
        document.querySelector('input[name=jam_selesai]').value = formatTime(res.data.jam_selesai);
        new bootstrap.Modal(document.getElementById('scheduleModal')).show();
    });
}

function hapusSchedule(id) {
    if (!confirm('Yakin hapus jadwal ini?')) return;
    apiCall(`/schedules/${id}`, 'DELETE')
        .done(res => { showAlert('success', res.message); loadSchedules(); })
        .fail(xhr => showAlert('error', xhr.responseJSON?.message || 'Gagal menghapus'));
}

document.getElementById('btnTambah').onclick = openCreateModal;
document.getElementById('filterDokter').onchange = loadSchedules;

document.getElementById('formSchedule').onsubmit = function(e) {
    e.preventDefault();
    const id         = document.querySelector('input[name=id]').value;
    const jamMulai   = document.querySelector('input[name=jam_mulai]').value;
    const jamSelesai = document.querySelector('input[name=jam_selesai]').value;
    if (jamMulai >= jamSelesai) { alert('Jam mulai harus sebelum jam selesai'); return; }

    const data = {
        hari:        document.querySelector('select[name=hari]').value,
        jam_mulai:   jamMulai,
        jam_selesai: jamSelesai
    };
    if (!id) data.dokter_id = parseInt(document.querySelector('select[name=dokter_id]').value);

    apiCall(id ? `/schedules/${id}` : '/schedules', id ? 'PUT' : 'POST', data)
        .done(res => {
            bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
            showAlert('success', res.message);
            loadSchedules();
        })
        .fail(xhr => showAlert('error', xhr.responseJSON?.message || 'Gagal menyimpan'));
};

loadDokterOptions();
loadSchedules();
