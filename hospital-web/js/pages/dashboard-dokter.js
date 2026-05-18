let dashboardPolling = null;

$(function () {
  requireRole("dokter");
  injectNavbar("dokter", "dashboard");

  // Tampilkan nama & tanggal
  $("#userName").text(getUser().name);
  $("#tanggalHariIni").text(
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  // Load data pertama kali
  loadAntrianDashboard();
  loadJadwalDashboard();

  // Auto-refresh antrian tiap 5 detik (sesuai requirement queue system)
  dashboardPolling = setInterval(loadAntrianDashboard, 5000);

  // Bersihkan interval saat pindah halaman
  $(window).on("beforeunload", function () {
    if (dashboardPolling) clearInterval(dashboardPolling);
  });
});

/* ─────────────────────────────────────────
   ANTRIAN
───────────────────────────────────────── */

function loadAntrianDashboard() {
  const today = new Date().toISOString().split("T")[0];

  apiCall("/queue/today?tanggal=" + today, "GET")
    .done(function (res) {
      const data = res.data || [];

      // Hitung statistik
      const stats = { menunggu: 0, selesai: 0, batal: 0 };
      data.forEach(function (q) {
        if (stats[q.status] !== undefined) stats[q.status]++;
      });

      $("#statTotal").text(data.length);
      $("#statMenunggu").text(stats.menunggu);
      $("#statSelesai").text(stats.selesai);

      // Render list
      if (data.length === 0) {
        $("#antrianList").html(renderEmpty("🎉", "Tidak ada antrian hari ini"));
        return;
      }

      // Prioritaskan yang menunggu, tampilkan max 5
      var sorted = data
        .slice()
        .sort(function (a, b) {
          if (a.status === "menunggu" && b.status !== "menunggu") return -1;
          if (a.status !== "menunggu" && b.status === "menunggu") return 1;
          return a.nomor_antrian - b.nomor_antrian;
        })
        .slice(0, 5);

      var html = sorted.map(renderAntrianItem).join("");

      // Tombol lihat semua jika lebih dari 5
      if (data.length > 5) {
        html +=
          '<div class="text-center py-3">' +
          '<a href="antrian.html" class="btn btn-sm btn-outline-primary" ' +
          'style="border-radius:8px;font-size:0.8rem">' +
          "Lihat semua " +
          data.length +
          " antrian →</a></div>";
      }

      $("#antrianList").html(html);
    })
    .fail(function () {
      $("#antrianList").html(renderEmpty("⚠️", "Gagal memuat antrian"));
    });
}

function renderAntrianItem(q) {
  var actionBtn = "";
  if (q.status === "menunggu") {
    actionBtn =
      '<button class="btn btn-sm btn-success ms-2" ' +
      'style="font-size:0.75rem;border-radius:8px;padding:3px 10px" ' +
      'onclick="selesaikanAntrian(' +
      q.id +
      ')">Selesai</button>';
  }

  return (
    '<div class="antrian-item">' +
    '<div class="nomor-box ' +
    q.status +
    '">' +
    q.nomor_antrian +
    "</div>" +
    '<div class="pasien-info">' +
    '<div class="pasien-nama">' +
    q.nama_pasien +
    "</div>" +
    '<div class="pasien-meta">No. ' +
    q.nomor_antrian +
    " · " +
    formatDate(q.tanggal) +
    "</div>" +
    "</div>" +
    '<span class="pill pill-' +
    q.status +
    '">' +
    ucFirst(q.status) +
    "</span>" +
    actionBtn +
    "</div>"
  );
}

function selesaikanAntrian(id) {
  if (!confirm("Tandai antrian ini sebagai SELESAI?")) return;

  apiCall("/queue/" + id + "/status", "PUT", { status: "selesai" })
    .done(function (res) {
      var box = $("#flash-alert");
      box.text(res.message || "Antrian ditandai selesai.").show();
      setTimeout(function () {
        box.fadeOut();
      }, 3000);
      loadAntrianDashboard();
    })
    .fail(function (xhr) {
      alert(
        xhr.responseJSON ? xhr.responseJSON.message : "Gagal update status"
      );
    });
}

/* ─────────────────────────────────────────
   JADWAL
───────────────────────────────────────── */

function loadJadwalDashboard() {
  apiCall("/schedules", "GET")
    .done(function (res) {
      var data = res.data || [];

      $("#statJadwal").text(data.length);

      if (data.length === 0) {
        $("#jadwalList").html(renderEmpty("📅", "Belum ada jadwal terdaftar"));
        return;
      }

      // Urutkan berdasarkan hari
      var hariOrder = [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu",
      ];
      var sorted = data.slice().sort(function (a, b) {
        return hariOrder.indexOf(a.hari) - hariOrder.indexOf(b.hari);
      });

      var html = sorted
        .map(function (j) {
          return (
            '<div class="jadwal-item">' +
            '<div class="jadwal-hari">' +
            j.hari +
            "</div>" +
            '<div class="jadwal-jam">' +
            formatTime(j.jam_mulai) +
            " – " +
            formatTime(j.jam_selesai) +
            "</div>" +
            '<div class="jadwal-poli">' +
            (j.nama_poli || "Poli") +
            "</div>" +
            "</div>"
          );
        })
        .join("");

      $("#jadwalList").html(html);
    })
    .fail(function () {
      $("#jadwalList").html(renderEmpty("⚠️", "Gagal memuat jadwal"));
    });
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

function renderEmpty(icon, msg) {
  return (
    '<div class="empty-state"><div class="ei">' +
    icon +
    "</div><div>" +
    msg +
    "</div></div>"
  );
}

function ucFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
