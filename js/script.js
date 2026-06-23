let hasilGenerate = [];

// ===================================================
// KONFIGURASI
// ===================================================

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzN2lSLvm3rxiiHQzL11YILjwrJThymMl8XfIT27q7ZFdeyvWxeifodOPM8ah94UiYGzQ/exec";

// ===================================================
// GENERATE JUDUL
// ===================================================

async function generateJudul() {
  const keyword = document.getElementById("keyword").value.trim();

  if (!keyword) {
    showToast("Masukkan keyword terlebih dahulu", "warning");
    return;
  }

  const btn = document.getElementById("btnGenerate");
  const loading = document.getElementById("loading");
  const hasil = document.getElementById("hasil");

  btn.disabled = true;

  btn.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        Generating...
    `;

  loading.style.display = "block";

  hasil.innerHTML = "";

  try {
    const jumlah = document.getElementById("jumlahJudul").value;

    const response = await fetch(
      `${WEB_APP_URL}?keyword=${encodeURIComponent(keyword)}&jumlah=${jumlah}`,
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data dari server");
    }

    const data = await response.json();

    tampilkanHasil(data);

    document.getElementById("totalJudul").textContent = data.length;

    document.getElementById("lastKeyword").textContent = keyword;

    showToast("Judul berhasil dibuat", "success");
  } catch (err) {
    hasil.innerHTML = `
            <div class="alert alert-danger">
                ${err.message}
            </div>
        `;

    console.error(err);
  } finally {
    loading.style.display = "none";

    btn.disabled = false;

    btn.innerHTML = `
            ✨ Generate Judul
        `;
  }
}

// ===================================================
// TAMPILKAN HASIL
// ===================================================

function tampilkanHasil(data) {
  hasilGenerate = data;

  const hasil = document.getElementById("hasil");

  hasil.innerHTML = "";

  if (!data || data.length === 0) {
    hasil.innerHTML = `
            <div class="empty-state">
                Tidak ada data ditemukan
            </div>
        `;

    return;
  }

  data.forEach((judul, index) => {
    hasil.innerHTML += `

            <div class="hasil-item">

                <div class="nomor">
                    ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="judul-text">
                    ${judul}
                </div>

                <button
                    class="btn-copy"
                    onclick="copyText('${judul.replace(/'/g, "\\'")}')">

                    <i class="bi bi-copy"></i>
                    Salin

                </button>

            </div>

        `;
  });
}

// ===================================================
// COPY SATU JUDUL
// ===================================================

function copyText(text) {
  navigator.clipboard.writeText(text);

  showToast("Judul berhasil disalin", "success");
}

// ===================================================
// COPY SEMUA
// ===================================================

document.getElementById("copySemua").addEventListener("click", () => {
  const semua = [];

  document.querySelectorAll(".judul-text").forEach((item) => {
    semua.push(item.textContent);
  });

  if (semua.length === 0) {
    showToast("Belum ada hasil", "warning");

    return;
  }

  navigator.clipboard.writeText(semua.join("\n"));

  showToast("Semua judul berhasil disalin", "success");
});

// ===================================================
// BERSIHKAN
// ===================================================

function bersihkanHasil() {
  document.getElementById("keyword").value = "";

  document.getElementById("hasil").innerHTML = `
        <div class="empty-state">
            Belum ada judul yang dihasilkan
        </div>
    `;

  document.getElementById("totalJudul").textContent = "0";

  document.getElementById("lastKeyword").textContent = "-";

  showToast("Hasil dibersihkan", "success");
}

// ===================================================
// ENTER = GENERATE
// ===================================================

document.getElementById("keyword").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    generateJudul();
  }
});

// ===================================================
// TOAST NOTIFICATION
// ===================================================

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `
        position-fixed
        top-0
        end-0
        m-4
        alert
        ${type === "success" ? "alert-success" : "alert-warning"}
    `;

  toast.style.zIndex = "9999";

  toast.innerHTML = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// ===================================================
// EXPORT PDF
// ===================================================

document.getElementById("exportPdf").addEventListener("click", exportPDF);

function exportPDF() {
  if (hasilGenerate.length === 0) {
    showToast("Belum ada hasil generate", "warning");

    return;
  }

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFontSize(18);

  doc.text("Hasil Generate Judul Artikel", 20, 20);

  doc.setFontSize(12);

  let y = 35;

  hasilGenerate.forEach((judul, index) => {
    doc.text(`${index + 1}. ${judul}`, 20, y);

    y += 10;

    if (y > 270) {
      doc.addPage();

      y = 20;
    }
  });

  doc.save("judul-artikel.pdf");
}

// ===================================================
// EXPORT EXCEL
// ===================================================

document.getElementById("exportExcel").addEventListener("click", exportExcel);

function exportExcel() {
  if (hasilGenerate.length === 0) {
    showToast("Belum ada hasil generate", "warning");

    return;
  }

  const dataExcel = hasilGenerate.map((judul, index) => ({
    No: index + 1,

    Judul: judul,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataExcel);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Judul Artikel");

  XLSX.writeFile(workbook, "judul-artikel.xlsx");

  function logout() {
    localStorage.removeItem("login");

    window.location.href = "login.html";
  }
}
