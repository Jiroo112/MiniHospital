var pollingInterval = null;

$(function () {
  requireRole("dokter");
  injectNavbar("dokter", "antrian");

  var today = new Date().toISOString().split("T")[0];
  $("#filterTanggal").val(today);
  $("#tanggalHeader").text(
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  loadAntrian();
  startPolling();

  $("#filterTanggal").on("change", function () {
    stopPolling();
    loadAntrian();
    startPolling();
  });

  $("#btnRefresh").on("click", loadAntrian);

  $(window).on("beforeunload", stopPolling);
});

/* ─── Polling ─── */

function startPolling() {
  pollingInterval = setInterval(loadAntrian, 5000);
  $("#pollingStatus").html("🟢 Auto-refresh 5 detik");
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

/* ─── Load Data ─── */

function loadAntrian() {
  var tanggal = $("#filterTanggal").val();

  apiCall("/queue/today?tanggal=" + tanggal, "GET")
    .done(function (res) {
      var data = res.data || [];

      // Update statistik
      var stats = { menunggu: 0, selesai: 0, batal: 0 };
      data.forEach(function (q) {
        if (stats[q.status] !== undefined) stats[q.status]++;
      });

      $("#totalAntrian").text(data.length);
      $("#statMenunggu").text(stats.menunggu);
      $("#statSelesai").text(stats.selesai);
      $("#statBatal").text(stats.batal);
      $("#lastUpdate").text(new Date().toLocaleTimeString("id-ID"));

      if (data.length === 0) {
        $("#tableBody").html(
          '<tr><td colspan="6">' +
            '<div class="empty-state"><div class="ei">🎉</div>' +
            "<div>Tidak ada antrian pada tanggal ini</div></div>" +
            "</td></tr>"
        );
        return;
      }

      var rows = data
        .map(function (q, idx) {
          return (
            '<tr class="' +
            (q.status === "menunggu" ? "row-menunggu" : "") +
            '">' +
            "<td>" +
            (idx + 1) +
            "</td>" +
            '<td><span class="nomor-box ' +
            q.status +
            '">' +
            q.nomor_antrian +
            "</span></td>" +
            "<td><strong>" +
            q.nama_pasien +
            "</strong></td>" +
            "<td>" +
            formatDate(q.tanggal) +
            "</td>" +
            '<td><span class="pill pill-' +
            q.status +
            '">' +
            ucFirst(q.status) +
            "</span></td>" +
            "<td>" +
            renderActions(q) +
            "</td>" +
            "</tr>"
          );
        })
        .join("");

      $("#tableBody").html(rows);
    })
    .fail(function () {
      $("#tableBody").html(
        '<tr><td colspan="6">' +
          '<div class="empty-state"><div class="ei">⚠️</div>' +
          "<div>Gagal memuat antrian</div></div>" +
          "</td></tr>"
      );
    });
}

/* ─── Render Helpers ─── */

function renderActions(queue) {
  var btn =
    '<a href="rekam-medis.html?pasien_id=' +
    queue.pasien_id +
    "&nama=" +
    encodeURIComponent(queue.nama_pasien) +
    '" class="btn-action btn-rekam me-1">📝 Rekam Medis</a>';

  if (queue.status === "menunggu") {
    btn +=
      '<button class="btn-action btn-selesai" ' +
      'onclick="selesaiAntrian(' +
      queue.id +
      ')">✓ Selesai</button>';
  }
  return btn;
}

function selesaiAntrian(id) {
  if (!confirm("Tandai antrian ini sebagai SELESAI?")) return;

  apiCall("/queue/" + id + "/status", "PUT", { status: "selesai" })
    .done(function (res) {
      var box = $("#alert-box");
      box.text(res.message || "Antrian ditandai selesai.").show();
      setTimeout(function () {
        box.fadeOut();
      }, 3000);
      loadAntrian();
    })
    .fail(function (xhr) {
      alert(
        xhr.responseJSON ? xhr.responseJSON.message : "Gagal update status"
      );
    });
}

function ucFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
