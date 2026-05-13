$(function() {
    requireRole('admin');
    injectNavbar('admin', 'poli');

    loadPoli();

    // Tombol "Tambah Poli"
    $('#btnTambah').on('click', openCreateModal);

    // Submit form (handle create & update)
    $('#formPoli').on('submit', handleSubmit);
});

function loadPoli() {
    $('#tableBody').html('<tr><td colspan="4" class="text-center">Memuat...</td></tr>');

    apiCall('/poli', 'GET').done(function(res) {
        if (!res.data || res.data.length === 0) {
            $('#tableBody').html('<tr><td colspan="4" class="text-center text-muted">Belum ada data poli</td></tr>');
            return;
        }

        const rows = res.data.map((p, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${p.nama_poli}</td>
                <td>${p.lokasi || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${p.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="hapusPoli(${p.id}, '${p.nama_poli}')">Hapus</button>
                </td>
            </tr>
        `).join('');

        $('#tableBody').html(rows);
    });
}

function openCreateModal() {
    $('#modalTitle').text('Tambah Poli');
    $('#formPoli')[0].reset();
    $('input[name=id]').val('');
    $('#poliModal').modal('show');
}

function openEditModal(id) {
    apiCall(`/poli/${id}`, 'GET').done(function(res) {
        if (res.status && res.data) {
            $('#modalTitle').text('Edit Poli');
            $('input[name=id]').val(res.data.id);
            $('input[name=nama_poli]').val(res.data.nama_poli);
            $('input[name=lokasi]').val(res.data.lokasi || '');
            $('#poliModal').modal('show');
        }
    });
}

function handleSubmit(e) {
    e.preventDefault();

    const id = $('input[name=id]').val();
    const data = {
        nama_poli: $('input[name=nama_poli]').val(),
        lokasi:    $('input[name=lokasi]').val()
    };

    const endpoint = id ? `/poli/${id}` : '/poli';
    const method   = id ? 'PUT' : 'POST';

    apiCall(endpoint, method, data)
        .done(function(res) {
            $('#poliModal').modal('hide');
            showAlert('#alert-box', 'success', res.message);
            loadPoli();
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal menyimpan';
            alert(msg);
        });
}

function hapusPoli(id, nama) {
    if (!confirm(`Yakin hapus poli "${nama}"?`)) return;

    apiCall(`/poli/${id}`, 'DELETE')
        .done(function(res) {
            showAlert('#alert-box', 'success', res.message);
            loadPoli();
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal menghapus';
            alert(msg);
        });
}