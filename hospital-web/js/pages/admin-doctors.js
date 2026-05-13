$(function() {
    requireRole('admin');
    injectNavbar('admin', 'doctors');

    loadDoctors();
    loadPoliOptions();

    $('#btnTambah').on('click', openCreateModal);
    $('#formDoctor').on('submit', handleSubmit);
});

function loadDoctors() {
    $('#tableBody').html('<tr><td colspan="7" class="text-center">Memuat...</td></tr>');

    apiCall('/doctors', 'GET').done(function(res) {
        if (!res.data || res.data.length === 0) {
            $('#tableBody').html('<tr><td colspan="7" class="text-center text-muted">Belum ada data dokter</td></tr>');
            return;
        }

        const rows = res.data.map((d, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${d.nama}</td>
                <td>${d.email}</td>
                <td>${d.spesialis || '-'}</td>
                <td>${d.poli?.nama_poli || '-'}</td>
                <td>${d.no_hp || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${d.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="hapusDoctor(${d.id}, '${d.nama}')">Hapus</button>
                </td>
            </tr>
        `).join('');

        $('#tableBody').html(rows);
    });
}

function loadPoliOptions() {
    apiCall('/poli', 'GET').done(function(res) {
        if (res.data) {
            const options = ['<option value="">-- Pilih Poli --</option>']
                .concat(res.data.map(p => `<option value="${p.id}">${p.nama_poli}</option>`))
                .join('');
            $('select[name=poli_id]').html(options);
        }
    });
}

function openCreateModal() {
    $('#modalTitle').text('Tambah Dokter');
    $('#formDoctor')[0].reset();
    $('input[name=id]').val('');

    // Mode CREATE: password wajib, email bisa diisi
    $('#passwordGroup').show();
    $('input[name=password]').prop('required', true);
    $('input[name=email]').prop('readonly', false);

    $('#doctorModal').modal('show');
}

function openEditModal(id) {
    apiCall(`/doctors/${id}`, 'GET').done(function(res) {
        if (!res.status || !res.data) return;

        $('#modalTitle').text('Edit Dokter');
        $('input[name=id]').val(res.data.id);
        $('input[name=name]').val(res.data.nama);
        $('input[name=email]').val(res.data.email);
        $('input[name=spesialis]').val(res.data.spesialis || '');
        $('input[name=no_hp]').val(res.data.no_hp || '');
        $('select[name=poli_id]').val(res.data.poli_id);

        // Mode EDIT: sembunyikan password, email read-only
        $('#passwordGroup').hide();
        $('input[name=password]').prop('required', false).val('');
        $('input[name=email]').prop('readonly', true);

        $('#doctorModal').modal('show');
    });
}

function handleSubmit(e) {
    e.preventDefault();

    const id = $('input[name=id]').val();
    const data = {
        name:      $('input[name=name]').val(),
        spesialis: $('input[name=spesialis]').val(),
        no_hp:     $('input[name=no_hp]').val(),
        poli_id:   parseInt($('select[name=poli_id]').val())
    };

    // Saat create, tambahkan email & password
    if (!id) {
        data.email    = $('input[name=email]').val();
        data.password = $('input[name=password]').val();
    }

    const endpoint = id ? `/doctors/${id}` : '/doctors';
    const method   = id ? 'PUT' : 'POST';

    apiCall(endpoint, method, data)
        .done(function(res) {
            $('#doctorModal').modal('hide');
            showAlert('#alert-box', 'success', res.message);
            loadDoctors();
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal menyimpan';
            alert(msg);
        });
}

function hapusDoctor(id, nama) {
    if (!confirm(`Yakin hapus dokter "${nama}"? Akun login dokter ini juga akan ikut terhapus.`)) return;

    apiCall(`/doctors/${id}`, 'DELETE')
        .done(function(res) {
            showAlert('#alert-box', 'success', res.message);
            loadDoctors();
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal menghapus';
            alert(msg);
        });
}