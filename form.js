const API_URL = "https://dummyjson.com/products?limit=30";
const KURS = 16000;

const rules = {
  nama: { min: 3, max: 60 },
  jumlah: { min: 1, max: 99 }
};

let products = [];

const formAlert = document.getElementById("form-alert");
const formAlertText = document.getElementById("form-alert-text");
const formRetryBtn = document.getElementById("form-retry-btn");

const orderForm = document.getElementById("order-form");
const nameInput = document.getElementById("customer-name");
const productSelect = document.getElementById("product-select");
const quantityInput = document.getElementById("quantity");

const summaryCard = document.getElementById("order-summary");
const summaryPlaceholder = document.getElementById("summary-placeholder");
const summaryDetail = document.getElementById("summary-detail");

function formatRupiah(usd) {
  return "Rp " + Math.round(usd * KURS).toLocaleString("id-ID");
}

async function fetchProducts() {
  formAlert.classList.add("hidden");
  productSelect.disabled = true;
  productSelect.innerHTML = '<option value="">Memuat produk...</option>';

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Server mengembalikan status " + response.status);
    }

    const data = await response.json();

    products = data.products;
    fillProductSelect();
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    productSelect.innerHTML = '<option value="">Produk gagal dimuat</option>';
    formAlertText.textContent =
      "Daftar produk gagal dimuat. Periksa koneksi internet Anda lalu coba lagi. (" +
      error.message + ")";
    formAlert.classList.remove("hidden");
  }
}

function fillProductSelect() {
  productSelect.innerHTML = '<option value="">-- Pilih produk --</option>';

  products.forEach(function (product) {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.title + " - " + formatRupiah(product.price);
    productSelect.appendChild(option);
  });

  productSelect.disabled = false;
}

function checkName() {
  const value = nameInput.value.trim();

  if (value === "") {
    return "Nama pelanggan wajib diisi.";
  }
  if (value.length < rules.nama.min) {
    return "Nama minimal " + rules.nama.min + " karakter.";
  }
  if (value.length > rules.nama.max) {
    return "Nama maksimal " + rules.nama.max + " karakter.";
  }
  if (!/[a-zA-Z]/.test(value)) {
    return "Nama harus mengandung huruf.";
  }
  return "";
}

function checkProduct() {
  return productSelect.value === "" ? "Silakan pilih produk." : "";
}

function checkQuantity() {
  const raw = quantityInput.value.trim();
  const number = Number(raw);

  if (raw === "") {
    return "Jumlah wajib diisi.";
  }
  if (!Number.isInteger(number)) {
    return "Jumlah harus berupa angka bulat.";
  }
  if (number < rules.jumlah.min) {
    return "Jumlah minimal " + rules.jumlah.min + ".";
  }
  if (number > rules.jumlah.max) {
    return "Jumlah maksimal " + rules.jumlah.max + ".";
  }
  return "";
}

function showMessage(input, errorId, message) {
  const group = input.parentElement;
  document.getElementById(errorId).textContent = message;
  group.classList.toggle("invalid", message !== "");
  group.classList.toggle("valid", message === "" && input.value.trim() !== "");
}

function clearMessages() {
  document.querySelectorAll(".field-error").forEach(function (el) {
    el.textContent = "";
  });
  document.querySelectorAll(".form-group").forEach(function (el) {
    el.classList.remove("invalid", "valid");
  });
}

function showSummary(name, product, quantity) {
  const total = product.price * quantity;

  document.getElementById("summary-name").textContent = name;
  document.getElementById("summary-product").textContent = product.title;
  document.getElementById("summary-quantity").textContent = quantity;
  document.getElementById("summary-price").textContent = formatRupiah(product.price);
  document.getElementById("summary-total").textContent = formatRupiah(total);

  summaryPlaceholder.classList.add("hidden");
  summaryDetail.classList.remove("hidden");
  summaryCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

nameInput.addEventListener("input", function () {
  showMessage(nameInput, "name-error", checkName());
});

productSelect.addEventListener("change", function () {
  showMessage(productSelect, "product-error", checkProduct());
});

quantityInput.addEventListener("input", function () {
  showMessage(quantityInput, "quantity-error", checkQuantity());
});

orderForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const nameMessage = checkName();
  const productMessage = checkProduct();
  const quantityMessage = checkQuantity();

  showMessage(nameInput, "name-error", nameMessage);
  showMessage(productSelect, "product-error", productMessage);
  showMessage(quantityInput, "quantity-error", quantityMessage);

  if (nameMessage || productMessage || quantityMessage) {
    return;
  }

  const selectedProduct = products.find(function (item) {
    return item.id === Number(productSelect.value);
  });

  showSummary(nameInput.value.trim(), selectedProduct, Number(quantityInput.value));
});

orderForm.addEventListener("reset", function () {
  clearMessages();
  summaryDetail.classList.add("hidden");
  summaryPlaceholder.classList.remove("hidden");
});

formRetryBtn.addEventListener("click", fetchProducts);

fetchProducts();