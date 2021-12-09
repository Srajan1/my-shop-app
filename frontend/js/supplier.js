const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

const addSuppierFo = function () {};
let pageNumber = 1, totalPages, limit = 2;

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
  console.log("button clicked");
  ipcRenderer.send("add-supplier", supplier);
};

const previousPage = function () {
  --pageNumber;
  ipcRenderer.send("supplier-window-loaded", pageNumber);
};

const nextPage = function () {
  ++pageNumber;
  ipcRenderer.send("supplier-window-loaded", pageNumber);
};

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("supplier-window-loaded", pageNumber);
  const addSupplierFormToggle = document.querySelector(
    "#add-supplier-form-toggle"
  );
  addSupplierFormToggle.addEventListener("click", () => {
    if (document.querySelector("form").style.display == "none")
      document.querySelector("form").style.display = "block";
    else document.querySelector("form").style.display = "none";
  });
  const saveSupplierDetails = document.querySelector("#save-supplier-details");
  saveSupplierDetails.addEventListener("click", (e) => {
    saveSupplier();
  });

  const prevButton = document.querySelector("#prev-button");
  const nextButton = document.querySelector("#next-button");
  prevButton.addEventListener("click", () => {
    nextButton.classList.remove('disabled');
    if (pageNumber === 2) {
      prevButton.classList.add("disabled");
    }
    previousPage();
  });
  if (pageNumber === 1) {
    prevButton.classList.add("disabled");
  }
  nextButton.addEventListener("click", () => {
    prevButton.classList.remove("disabled");
    nextPage();
    if(pageNumber === totalPages)
    nextButton.classList.add('disabled');
  });
});

ipcRenderer.on("supplier-added", (evt, result) => {
  ipcRenderer.send("supplier-window-loaded", pageNumber);
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
  totalPages = Math.floor(count/limit);
  if(count%limit != 0)
  ++totalPages;
  console.log(`${totalPages} ${pageNumber}`);
});
