const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const convertJsonToExcel = require('../partials/generateExcel');

const addSuppierFo = function () {};
let pageNumber = 1,
  totalPages,
  limit = 20,
  where = {};

  const manageFunction = () => {
    const manageButton = document.querySelectorAll('.manage-button')
    var i;
    for (i = 0; i < manageButton.length; i++) {
      manageButton[i].onclick = function () {
        sessionStorage.setItem("supplierId", this.id);
      };
    }
  };

document.querySelector('#download-excel-data').addEventListener('click', () => {
  ipcRenderer.send('fetch-all-suppliers');
})

ipcRenderer.on('all-suppliers-fetched', (event, data) => {
  convertJsonToExcel(data);
})

const saveSupplier = async function (e) {
  const supplierName = document.querySelector("#supplier-name").value;
  const supplierPhone = document.querySelector("#supplier-phone-number").value;
  const supplierAddress = document.querySelector("#supplier-address").value;
  const supplierDescription = document.querySelector(
    "#supplier-description"
  ).value;
  const supplier = {};
  if (supplierName !== "") supplier.name = supplierName;
  if (supplierPhone !== "") supplier.phoneNumber = supplierPhone;
  if (supplierAddress !== "") supplier.address = supplierAddress;
  if (supplierDescription !== "") supplier.description = supplierDescription;

  ipcRenderer.send("add-supplier", supplier);
};

const prevButton = document
  .querySelector("#prev-button")
  .addEventListener("click", () => {
    --pageNumber;
    ipcRenderer.send("supplier-window-loaded", { pageNumber, where, limit });
  });

const nextButton = document
  .querySelector("#next-button")
  .addEventListener("click", () => {
    ++pageNumber;
    ipcRenderer.send("supplier-window-loaded", { pageNumber, where, limit });
  });

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

    document.querySelector("#filter-name").value = "";
    document.querySelector("#filter-phone").value = "";
    document.querySelector("#filter-address").value = "";
    ipcRenderer.send("supplier-window-loaded", { pageNumber, where, limit });
  });

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("supplier-window-loaded", { pageNumber, where, limit });
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
});

ipcRenderer.on("supplier-added", (evt, result) => {
  ipcRenderer.send("show-message", { heading: 'Supplier added', message: 'New supplier has been added' });
  ipcRenderer.send("supplier-window-loaded", { pageNumber, where, limit });
});

ipcRenderer.on("fetched-suppliers", (event, suppliersInfo) => {
  const suppliers = suppliersInfo.supplierArray,
    count = suppliersInfo.count;
  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
  totalPages = Math.ceil(count / limit);
  if (pageNumber === 1)
    document.querySelector("#prev-button").style.pointerEvents = "none";
  else document.querySelector("#prev-button").style.pointerEvents = "auto";
  if (pageNumber === totalPages)
    document.querySelector("#next-button").style.pointerEvents = "none";
  else document.querySelector("#next-button").style.pointerEvents = "auto";
  suppliers.forEach((supplier) => {
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${supplier.name}</td>
    <td>${supplier.phoneNumber}</td>
    <td>${supplier.address}</td>
    <td><a href="supplierSpecific.html" class="transparent btn manage-button"  id="${supplier.id}">📝</a></td></tr>`;
    tableBody.appendChild(row);
  });
  manageFunction();
  totalPages = Math.floor(count / limit);
  if (count % limit != 0) ++totalPages;
  const currentPage = document.querySelector("#current-page");
  currentPage.innerText = `page ${pageNumber}`;
});
