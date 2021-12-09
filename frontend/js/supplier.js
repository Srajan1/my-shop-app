const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

const addSuppierFo = function () {};
let pageNumber = 1,
  totalPages,
  limit = 20,
  where = {};

const saveSupplier = async function (e) {
  const supplierName = document.querySelector("#supplier-name").value;
  const supplierPhone = document.querySelector("#supplier-phone-number").value;
  const supplierAddress = document.querySelector("#supplier-address").value;
  const supplierDescription = document.querySelector(
    "#supplier-description"
  ).value;
  const supplier = {};
  if (supplierName !== "") supplier.name = supplierName;
  if (supplierPhone !== "") supplier.phone = supplierPhone;
  if (supplierAddress !== "") supplier.address = supplierAddress;
  if (supplierDescription !== "") supplier.description = supplierDescription;

  ipcRenderer.send("add-supplier", supplier);
};

const previousPage = function () {
  --pageNumber;
  ipcRenderer.send("supplier-window-loaded", { pageNumber, where });
};

const nextPage = function () {
  ++pageNumber;
  ipcRenderer.send("supplier-window-loaded", { pageNumber, where });
};

document
  .querySelector("#filter-supplier-details")
  .addEventListener("click", (e) => {
    e.preventDefault();
    where = {};
    const filterName = document.querySelector("#filter-name").value;
    const filterPhone = document.querySelector("#filter-phone").value;
    const filterAddress = document.querySelector("#filter-address").value;
    if (filterName) where.name = filterName;
    if (filterPhone) where.phone = filterPhone;
    if (filterAddress) where.address = filterAddress;
    console.log(where);
    document.querySelector("#filter-name").value = "";
    document.querySelector("#filter-phone").value = "";
    document.querySelector("#filter-address").value = "";
    ipcRenderer.send("supplier-window-loaded", { pageNumber, where });
  });

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("supplier-window-loaded", { pageNumber, where });
  const addSupplierFormToggle = document.querySelector(
    "#add-supplier-form-toggle"
  );
  addSupplierFormToggle.addEventListener("click", () => {
    if (document.querySelector("#adding-form").style.display == "none")
      document.querySelector("#adding-form").style.display = "block";
    else document.querySelector("#adding-form").style.display = "none";
  });
  const saveSupplierDetails = document.querySelector("#save-supplier-details");
  saveSupplierDetails.addEventListener("click", (e) => {
    saveSupplier();
  });

  const filterFormToggle = document.querySelector("#filter-form-toggle");
  filterFormToggle.addEventListener("click", () => {
    if (document.querySelector("#filter-form").style.display == "none")
      document.querySelector("#filter-form").style.display = "block";
    else document.querySelector("#filter-form").style.display = "none";
  });

  const prevButton = document.querySelector("#prev-button");
  const nextButton = document.querySelector("#next-button");

  if (pageNumber === 1) prevButton.style.pointerEvents = "none";
  else prevButton.style.pointerEvents = "auto";

  prevButton.addEventListener("click", () => {
    previousPage();
    if (pageNumber === 1) prevButton.style.pointerEvents = "none";
    else prevButton.style.pointerEvents = "auto";

  });
  if (pageNumber === 1) {
    prevButton.style.pointerEvents = "none";
  }
  nextButton.addEventListener("click", () => {
    nextPage();
    if (pageNumber === 1) prevButton.style.pointerEvents = "none";
    else prevButton.style.pointerEvents = "auto";
    if (pageNumber === totalPages) nextButton.style.pointerEvents = "none";
  });
});

ipcRenderer.on("supplier-added", (evt, result) => {
  ipcRenderer.send("supplier-window-loaded", { pageNumber, where });
});

ipcRenderer.on("fetched-suppliers", (event, suppliersInfo) => {
  const suppliers = suppliersInfo.supplierArray,
    count = suppliersInfo.count;
  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
  suppliers.forEach((supplier) => {
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${supplier.name}</td>
    <td>${supplier.phoneNumber}</td>
    <td>${supplier.address}</td>
    <td><button class="transparent btn"  id="${supplier.id}_view"><abbr title="View">🔍</abbr></button></td>
    <td><button class="transparent btn"  id="${supplier.id}_edit"><abbr title="Edit">📝</abbr></button></td>
    <td><button class="transparent btn"  id="${supplier.id}_delete"><abbr title="Delete">❌</abbr></button></td></tr>`;
    tableBody.appendChild(row);
  });
  totalPages = Math.floor(count / limit);
  if (count % limit != 0) ++totalPages;
  const currentPage = document.querySelector("#current-page");
  currentPage.innerText = `page ${pageNumber}`;
});
