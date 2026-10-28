const API_URL = "https://dummyjson.com/products?limit=30";
const KURS = 16000;
const STOK_MENIPIS = 10;

let products = [];
let categories = [];

const loadingEl = document.getElementById("loading");
const errorBox = document.getElementById("error-box");
const errorMessage = document.getElementById("error-message");
const retryBtn = document.getElementById("retry-btn");
const toolbar = document.getElementById("toolbar");
const searchInput = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const resultInfo = document.getElementById("result-info");
const emptyMessage = document.getElementById("empty-message");
const productList = document.getElementById("product-list");

function formatRupiah(usd) {
  return "Rp " + Math.round(usd * KURS).toLocaleString("id-ID");
}

function labelKategori(category) {
  return category.replace(/-/g, " ");
}

function toneOf(category) {
  return categories.indexOf(category) % 6;
}

async function fetchProducts() {
  loadingEl.classList.remove("hidden");
  errorBox.classList.add("hidden");
  toolbar.classList.add("hidden");
  emptyMessage.classList.add("hidden");
  resultInfo.textContent = "";
  productList.innerHTML = "";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Server mengembalikan status " + response.status);
    }

    const data = await response.json();

    products = data.products;
    categories = [...new Set(products.map(function (item) {
      return item.category;
    }))];

    fillCategories();
    toolbar.classList.remove("hidden");
    applyFilters();
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    errorMessage.textContent =
      "Data produk gagal dimuat. Periksa koneksi internet Anda lalu coba lagi. (" +
      error.message + ")";
    errorBox.classList.remove("hidden");
  } finally {
    loadingEl.classList.add("hidden");
  }
}

function fillCategories() {
  categorySelect.innerHTML = '<option value="">Semua kategori</option>';

  categories.forEach(function (category) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = labelKategori(category);
    option.style.textTransform = "capitalize";
    categorySelect.appendChild(option);
  });
}

function renderProducts(list) {
  productList.innerHTML = "";
  emptyMessage.classList.toggle("hidden", list.length !== 0);
  resultInfo.textContent =
    "Menampilkan " + list.length + " dari " + products.length + " produk";

  list.forEach(function (product) {
    const card = document.createElement("article");
    card.className = "product-card tone-" + toneOf(product.category);

    const badge = product.stock < STOK_MENIPIS
      ? '<span class="badge-stock">Stok Menipis</span>'
      : "";

    card.innerHTML =
      '<div class="card-img">' +
        badge +
        '<img src="' + product.thumbnail + '" alt="' + product.title + '" loading="lazy">' +
      '</div>' +
      '<div class="card-body">' +
        '<span class="chip">' + labelKategori(product.category) + '</span>' +
        '<h3>' + product.title + '</h3>' +
        '<p class="price">' + formatRupiah(product.price) + '</p>' +
        '<p class="stock">Stok: ' + product.stock + '</p>' +
      '</div>';

    productList.appendChild(card);
  });
}

function applyFilters() {
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  const result = products.filter(function (item) {
    const matchName = item.title.toLowerCase().includes(keyword);
    const matchCategory = category === "" || item.category === category;
    return matchName && matchCategory;
  });

  renderProducts(result);
}

searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);
retryBtn.addEventListener("click", fetchProducts);

fetchProducts();