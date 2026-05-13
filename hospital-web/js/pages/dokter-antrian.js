let pollingInterval = null;

$(function() {
    requireRole('dokter');
    injectNavbar('dokter', 'antrian');

    // Set default tanggal ke hari ini
    $('#filterTanggal').val(new Date().toISOString().split('T')[0]);

    loadAntrian();
    startPolling();

    $('#filterTanggal').on('change', function() {
        stopPolling();
        loadAntrian();
        startPolling();
    });

    $('#btnRefresh').on('click', loadAntrian);

    // Stop polling saat user pindah halaman
    $(window).on('beforeunload', stopPolling);
});

function startPolling() {
    // Polling tiap 5 detik (sesuai PDF section 9)
    pollingInterval = setInterval(loadAntrian, 5000);
    $('#pollingStatus').html('<span class="badge bg-success">🟢 Auto-refresh aktif (tiap 5 detik)</span>');
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

function loadAntrian() {
    const tanggal = $('#filterTanggal').val();

    apiCall(`/queue/today?tanggal=${tanggal}`, 'GET').done(function(res) {
        $('#totalAntrian').text(res.meta?.total || 0);

        const stats = {
            menunggu: 0,
            selesai: 0,
            batal: 0
        };
        (res.data || []).forEach(q => {
            if (stats[q.status] !== undefined) stats[q.status]++;
        });

        $('#statMenunggu').text(stats.menunggu);
        $('#statSelesai').text(stats.selesai);
        $('#statBatal').text(stats.batal);

        if (!res.data || res.data.length === 0) {
            $('#tableBody').html('<tr><td colspan="6" class="text-center text-muted">Tidak ada antrian pada tanggal ini</td></tr>');
            return;
        }

        const rows = res.data.map((q, idx) => `
            <tr class="${q.status === 'menunggu' ? 'table-warning' : ''}">
                <td>${idx + 1}</td>
                <td><span class="badge bg-dark fs-5">${q.nomor_antrian}</span></td>
                <td>${q.nama_pasien}</td>
                <td>${formatDate(q.tanggal)}</td>
                <td>${renderStatusBadge(q.status)}</td>
                <td>${renderActions(q)}</td>
            </tr>
        `).join('');

        $('#tableBody').html(rows);
        $('#lastUpdate').text(new Date().toLocaleTimeString('id-ID'));
    });
}

function renderStatusBadge(status) {
    const badges = {
        menunggu: '<span class="badge bg-warning text-dark">Menunggu</span>',
        selesai:  '<span class="badge bg-success">Selesai</span>',
        batal:    '<span class="badge bg-secondary">Batal</span>'
    };
    return badges[status] || status;
}

function renderActions(queue) {
    let buttons = '';

    // Tombol Input Rekam Medis - boleh kapan saja
    buttons += `<a href="rekam-medis.html?pasien_id=${queue.pasien_id}&nama=${encodeURIComponent(queue.nama_pasien)}" 
                   class="btn btn-sm btn-info me-1">Rekam Medis</a>`;

    // Tombol Selesai - hanya kalau masih menunggu
    if (queue.status === 'menunggu') {
        buttons += `<button class="btn btn-sm btn-success" onclick="selesaiAntrian(${queue.id})">Selesai</button>`;
    }

    return buttons;
}

function selesaiAntrian(id) {
    if (!confirm('Tandai antrian ini sebagai SELESAI?')) return;

    apiCall(`/queue/${id}/status`, 'PUT', { status: 'selesai' })
        .done(function(res) {
            showAlert('#alert-box', 'success', res.message);
            loadAntrian();
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal update status';
            alert(msg);
        });
}