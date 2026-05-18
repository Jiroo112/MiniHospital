$(function () {
  requireRole("dokter");
  injectNavbar("dokter", "rekam");

  // Pre-fill dari URL param (datang dari halaman antrian)
  var urlParams = new URLSearchParams(window.location.search);
  var prefillPasienId = urlParams.get("pasien_id");
  var prefillNama = urlParams.get("nama");

  if (prefillPasienId) {
    $("input[name=pasien_id]").val(prefillPasienId);
  }

  if (prefillNama) {
    $("#namaPasienTag").html(
      '<span class="pasien-tag">👤 ' + prefillNama + "</span>"
    );
  }

  loadMyRecords();

  $("#formRekamMedis").on("submit", handleSubmit);
});

/* ─── Load Riwayat ─── */

function loadMyRecords() {
  var recentIds = JSON.parse(
    localStorage.getItem("recentMedicalRecords") || "[]"
  );

  if (recentIds.length === 0) {
    $("#rekamList").html(
      '<div class="empty-state"><div class="ei">📋</div>' +
        "<div>Belum ada rekam medis yang diinput di sesi ini</div></div>"
    );
    $("#jumlahRekam").text("");
    return;
  }

  // Fetch detail tiap rekam medis secara paralel
  var promises = recentIds.map(function (id) {
    return apiCall("/medical-records/" + id, "GET")
      .then(function (res) {
        return res.data || null;
      })
      .catch(function () {
        return null;
      });
  });

  Promise.all(promises).then(function (records) {
    var valid = records.filter(function (r) {
      return r !== null;
    });

    if (valid.length === 0) {
      $("#rekamList").html(
        '<div class="empty-state"><div class="ei">📋</div>' +
          "<div>Belum ada rekam medis</div></div>"
      );
      return;
    }

    $("#jumlahRekam").text(valid.length + " rekam medis");

    var html = valid
      .map(function (r) {
        return (
          '<div class="rekam-item">' +
          '<div class="rekam-item-header">' +
          '<div class="rekam-nama">👤 ' +
          (r.nama_pasien || "Pasien #" + r.pasien_id) +
          "</div>" +
          '<div class="rekam-waktu">' +
          formatDate(r.created_at) +
          "</div>" +
          "</div>" +
          '<div class="row g-2">' +
          '<div class="col-md-6">' +
          '<div class="rekam-field">' +
          '<div class="rekam-field-label">Diagnosa</div>' +
          '<div class="rekam-field-value">' +
          (r.diagnosa || "–") +
          "</div>" +
          "</div>" +
          "</div>" +
          '<div class="col-md-6">' +
          '<div class="rekam-field">' +
          '<div class="rekam-field-label">Tindakan</div>' +
          '<div class="rekam-field-value">' +
          (r.tindakan || "–") +
          "</div>" +
          "</div>" +
          "</div>" +
          '<div class="col-md-6">' +
          '<div class="rekam-field">' +
          '<div class="rekam-field-label">Resep</div>' +
          '<div class="rekam-field-value">' +
          (r.resep || "–") +
          "</div>" +
          "</div>" +
          "</div>" +
          '<div class="col-md-6">' +
          '<div class="rekam-field">' +
          '<div class="rekam-field-label">Catatan</div>' +
          '<div class="rekam-field-value">' +
          (r.catatan || "–") +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    $("#rekamList").html(html);
  });
}

/* ─── Submit Form ─── */

function handleSubmit(e) {
  e.preventDefault();

  var $btn = $("#btnSimpan");
  $btn.prop("disabled", true).text("Menyimpan...");

  var data = {
    pasien_id: parseInt($("input[name=pasien_id]").val()),
    diagnosa: $("textarea[name=diagnosa]").val(),
    tindakan: $("textarea[name=tindakan]").val(),
    resep: $("textarea[name=resep]").val(),
    catatan: $("textarea[name=catatan]").val(),
  };

  apiCall("/medical-records", "POST", data)
    .done(function (res) {
      showAlert(
        "#alert-box",
        "success",
        res.message || "Rekam medis berhasil disimpan!"
      );

      // Simpan ID ke localStorage untuk ditampilkan di list
      var recentIds = JSON.parse(
        localStorage.getItem("recentMedicalRecords") || "[]"
      );
      recentIds.unshift(res.data.id);
      localStorage.setItem(
        "recentMedicalRecords",
        JSON.stringify(recentIds.slice(0, 20))
      );

      // Reset form
      $("#formRekamMedis")[0].reset();
      $("#namaPasienTag").html("");

      loadMyRecords();
      $btn.prop("disabled", false).text("💾 Simpan Rekam Medis");

      // Scroll ke atas untuk lihat alert
      window.scrollTo({ top: 0, behavior: "smooth" });
    })
    .fail(function (xhr) {
      var msg = xhr.responseJSON
        ? xhr.responseJSON.message
        : "Gagal menyimpan rekam medis";
      showAlert("#alert-box", "danger", msg);
      $btn.prop("disabled", false).text("💾 Simpan Rekam Medis");
    });
}
