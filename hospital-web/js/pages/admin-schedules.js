const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

$(function() {
    requireRole('admin');
    injectNavbar('admin', 'schedules');

    loadSchedules();
    loadDokterOptions();
    loadHariOptions();

    $('#btnTambah').on('click', openCreateModal);
    $('#formSchedule').on('submit', handleSubmit);

    // Filter by dokter
    $('#filterDokter').on('change', loadSchedules);
});

function loadSchedules() {
    $('#tableBody').html('<tr><td colspan="6" class="text-center">Memuat...</td></tr>');

    const dokterId = $('#filterDokter').val();
    const endpoint = dokterId ? `/schedules?dokter_id=${dokterId}` : '/schedules';

    apiCall(endpoint, 'GET').done(function(res) {
        if (!res.data || res.data.length === 0) {
            $('#tableBody').html('<tr><td colspan="6" class="text-center text-muted">Belum ada jadwal</td></tr>');
            return;
        }

        const rows = res.data.map((s, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${s.nama_dokter}</td>
                <td><span class="badge bg-secondary">${s.hari}</span></td>
                <td>${formatTime(s.jam_mulai)}</td>
                <td>${formatTime(s.jam_selesai)}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${s.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="hapusSchedule(${s.id})">Hapus</button>
                </td>
            </tr>
        `).join('');

        $('#tableBody').html(rows);
    });
}

function loadDokterOptions() {
    apiCall('/doctors', 'GET').done(function(res) {
        if (!res.data) return;

        const filterOptions = ['<option value="">Semua Dokter</option>']
            .concat(res.data.map(d => `<option value="${d.id}">${d.nama}</option>`))
            .join('');
        $('#filterDokter').html(filterOptions);

        const formOptions = ['<option value="">-- Pilih Dokter --</option>']
            .concat(res.data.map(d => `<option value="${d.id}">${d.nama} (${d.spesialis || '-'})</option>`))
            .join('');
        $('select[name=dokter_id]').html(formOptions);
    });
}

function loadHariOptions() {
    const options = ['<option value="">-- Pilih Hari --</option>']
        .concat(HARI_OPTIONS.map(h => `<option value="${h}">${h}</option>`))
        .join('');
    $('select[name=hari]').html(options);
}

function openCreateModal() {
    $('#modalTitle').text('Tambah Jadwal');
    $('#formSchedule')[0].reset();
    $('input[name=id]').val('');
    $('select[name=dokter_id]').prop('disabled', false);
    $('#scheduleModal').modal('show');
}

function openEditModal(id) {
    apiCall(`/schedules/${id}`, 'GET').done(function(res) {
        if (!res.status || !res.data) return;

        $('#modalTitle').text('Edit Jadwal');
        $('input[name=id]').val(res.data.id);
        $('select[name=dokter_id]').val(res.data.dokter_id).prop('disabled', true);
        $('select[name=hari]').val(res.data.hari);
        $('input[name=jam_mulai]').val(formatTime(res.data.jam_mulai));
        $('input[name=jam_selesai]').val(formatTime(res.data.jam_selesai));

        $('#scheduleModal').modal('show');
    });
}

function handleSubmit(e) {
    e.preventDefault();

    const id = $('input[name=id]').val();
    const jamMulai   = $('input[name=jam_mulai]').val();
    const jamSelesai = $('input[name=jam_selesai]').val();

    // Validasi sisi frontend
    if (jamMulai >= jamSelesai) {
        alert('Jam mulai harus sebelum jam selesai');
        return;
    }

    const data = {
        hari:        $('select[name=hari]').val(),
        jam_mulai:   jamMulai,
        jam_selesai: jamSelesai
    };

    // dokter_id hanya disertakan saat create (tidak bisa diubah saat edit)
    if (!id) {
        data.dokter_id = parseInt($('select[name=dokter_id]').val());
    }

    const endpoint = id ? `/schedules/${id}` : '/schedules';
    const method   = id ? 'PUT' : 'POST';

    apiCall(endpoint, method, data)
        .done(function(res) {
            $('#scheduleModal').modal('hide');
            showAlert('#alert-box', 'success', res.message);
            loadSchedules();
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal menyimpan';
            alert(msg);
        });
}

function hapusSchedule(id) {
    if (!confirm('Yakin hapus jadwal ini?')) return;

    apiCall(`/schedules/${id}`, 'DELETE')
        .done(function(res) {
            showAlert('#alert-box', 'success', res.message);
            loadSchedules();
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal menghapus';
            alert(msg);
        });
}