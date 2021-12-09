const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

const addSuppierFo = function () {};

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

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("supplier-window-loaded", 1);
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
    e.preventDefault();
    saveSupplier();
  });
});

ipcRenderer.on("supplier-added", (evt, result) => {
  ipcRenderer.send("supplier-window-loaded", 1);
});

ipcRenderer.on('fetched-suppliers', (event, suppliers) => {
    const tableBody = document.querySelector('#table-body');
    suppliers.forEach(supplier => {
        var row = document.createElement('tr');
        row.innerHTML = 
            `<tr><td>${supplier.name}</td>
    <td>${supplier.phoneNumber}</td>
    <td>${supplier.address}</td>
    <td><button class="transparent btn"  id="${supplier.id}_view"><abbr title="View">🔍</abbr></button></td>
    <td><button class="transparent btn"  id="${supplier.id}_edit"><abbr title="Edit">📝</abbr></button></td>
    <td><button class="transparent btn"  id="${supplier.id}_delete"><abbr title="Delete">❌</abbr></button></td></tr>`;
    tableBody.appendChild(row);
    })
    
})