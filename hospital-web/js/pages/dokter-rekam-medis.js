$(function() {
    requireRole('dokter');
    injectNavbar('dokter', 'rekam');

    // Pre-fill dari URL param (kalau datang dari halaman antrian)
    const urlParams = new URLSearchParams(window.location.search);
    const prefillPasienId = urlParams.get('pasien_id');
    const prefillNama     = urlParams.get('nama');

    if (prefillPasienId) {
        $('input[name=pasien_id]').val(prefillPasienId);
        if (prefillNama) {
            $('#namaPasienInfo').text(`(Pasien: ${prefillNama})`);
        }
    }

    loadMyRecords();
    $('#formRekamMedis').on('submit', handleSubmit);
});

function loadMyRecords() {
    $('#tableBody').html('<tr><td colspan="6" class="text-center">Memuat...</td></tr>');

    // Ambil rekam medis untuk dokter ini.
    // Karena tidak ada endpoint khusus, kita fetch riwayat dari endpoint "by_patient"
    // tapi belum ideal. Untuk sekarang, kita pakai pendekatan: fetch lewat antrian yang sudah selesai.
    // Lebih clean: bikin endpoint /api/medical-records/by-doctor di backend (lihat catatan di bawah).

    // Untuk sementara, tampilkan rekam medis pasien yang baru diinput (yang ID-nya ada di session).
    const recentIds = JSON.parse(localStorage.getItem('recentMedicalRecords') || '[]');

    if (recentIds.length === 0) {
        $('#tableBody').html('<tr><td colspan="6" class="text-center text-muted">Belum ada rekam medis yang diinput di sesi ini</td></tr>');
        return;
    }

    // Fetch detail tiap rekam medis
    const promises = recentIds.map(id =>
        apiCall(`/medical-records/${id}`, 'GET').then(res => res.data).catch(() => null)
    );

    Promise.all(promises).then(records => {
        const valid = records.filter(r => r !== null);

        if (valid.length === 0) {
            $('#tableBody').html('<tr><td colspan="6" class="text-center text-muted">Belum ada rekam medis</td></tr>');
            return;
        }

        const rows = valid.map((r, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${r.nama_pasien}</td>
                <td>${r.diagnosa}</td>
                <td>${r.tindakan || '-'}</td>
                <td>${r.resep || '-'}</td>
                <td><small>${formatDate(r.created_at)}</small></td>
            </tr>
        `).join('');

        $('#tableBody').html(rows);
    });
}

function handleSubmit(e) {
    e.preventDefault();

    const $btn = $('#btnSimpan');
    $btn.prop('disabled', true).text('Menyimpan...');

    const data = {
        pasien_id: parseInt($('input[name=pasien_id]').val()),
        diagnosa:  $('textarea[name=diagnosa]').val(),
        tindakan:  $('textarea[name=tindakan]').val(),
        resep:     $('textarea[name=resep]').val(),
        catatan:   $('textarea[name=catatan]').val()
    };

    apiCall('/medical-records', 'POST', data)
        .done(function(res) {
            showAlert('#alert-box', 'success', res.message);

            // Simpan ID ke localStorage untuk tampilkan di list
            const recentIds = JSON.parse(localStorage.getItem('recentMedicalRecords') || '[]');
            recentIds.unshift(res.data.id);
            localStorage.setItem('recentMedicalRecords', JSON.stringify(recentIds.slice(0, 20)));

            $('#formRekamMedis')[0].reset();
            $('#namaPasienInfo').text('');
            loadMyRecords();
            $btn.prop('disabled', false).text('Simpan Rekam Medis');
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal menyimpan';
            alert(msg);
            $btn.prop('disabled', false).text('Simpan Rekam Medis');
        });
}