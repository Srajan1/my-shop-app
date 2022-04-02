const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const supplierId = sessionStorage.getItem("supplierId");
var fetchedData, totalPages;
var limit = 20,
  pageNumber = 1;
document
  .querySelector("#update-supplier-form-toggle")
  .addEventListener("click", () => {
    if (document.querySelector("#updation-form").style.display == "none")
      document.querySelector("#updation-form").style.display = "block";
    else document.querySelector("#updation-form").style.display = "none";
  });

const manageFunction = () => {
  const manageButton = document.querySelectorAll(".manage-button");
  var i;
  for (i = 0; i < manageButton.length; i++) {
    manageButton[i].onclick = function () {
      sessionStorage.setItem("orderId", this.id);
    };
  }
};

document.querySelector("#prev-button").addEventListener("click", () => {
  --pageNumber;
  ipcRenderer.send("fetch-order-for-supplier", {
    supplierId,
    limit,
    pageNumber,
  });
});

document.querySelector("#next-button").addEventListener("click", () => {
  ++pageNumber;
  ipcRenderer.send("fetch-order-for-supplier", {
    supplierId,
    limit,
    pageNumber,
  });
});

document.querySelector("#update-details").addEventListener("click", () => {
  const supplierName = document.querySelector("#supplier-name").value;
  const supplierPhone = document.querySelector("#supplier-phone-number").value;
  const supplierAddress = document.querySelector("#supplier-address").value;
  const supplierCity = document.querySelector("#supplier-city").value;
  const supplierPinCode = document.querySelector("#supplier-pin-code").value;
  const supplierState = document.querySelector("#supplier-state").value;
  const supplierBalance = document.querySelector('#supplier-previous-balance').value;
  const supplierDescription = document.querySelector(
    "#supplier-description"
  ).value;
  const supplier = {};
  if (supplierName !== "") supplier.name = supplierName;
  if (supplierPhone !== "") supplier.phoneNumber = supplierPhone;
  if (supplierAddress !== "") supplier.address = supplierAddress;
  if (supplierDescription !== "") supplier.description = supplierDescription;
  if (supplierCity !== "") supplier.city = supplierCity;
  if (supplierPinCode !== "") supplier.pinCode = supplierPinCode;
  if (supplierState !== "") supplier.state = supplierState;
  if (supplierBalance !== "") supplier.totalDeal = supplierBalance;
  ipcRenderer.send("update-supplier", { supplier, supplierId });
});

document.querySelector('#delete-form-toggle').addEventListener('click', () => {
  if(document.querySelector('#confirm-deletion').style.display == 'none')
  document.querySelector('#confirm-deletion').style.display = 'block';
  else document.querySelector('#confirm-deletion').style.display = 'none';
})

document.querySelector('#delete').addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('delete-supplier', (supplierId));
})
document.querySelector('#no-delete').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('#delete-form-toggle').click();
})
ipcRenderer.on('supplier-deleted', () => {
  window.location.href = './supplier.html'
})

ipcRenderer.on("supplier-data-fetched", (event, data) => {
  fetchedData = data;
  document.querySelector("#page-heading").innerText = fetchedData.name;
  const balanceSpan = document.querySelector('#deal-details');
  balanceSpan.innerText = `total dealt with ₹${fetchedData.totalDeal}`
  document.querySelector("#supplier-name").value = fetchedData.name;
  document.querySelector("#supplier-phone-number").value =
    fetchedData.phoneNumber;
  document.querySelector("#supplier-address").value = fetchedData.address;
  document.querySelector("#supplier-description").value =
    fetchedData.description;
    document.querySelector("#supplier-city").value = fetchedData.city;
    document.querySelector("#supplier-pin-code").value = fetchedData.pinCode;;
    document.querySelector("#supplier-state").value = fetchedData.state;
  ipcRenderer.send("fetch-order-for-supplier", {
    supplierId,
    limit,
    pageNumber,
  });
});

ipcRenderer.on("order-fetched-for-supplier", (event, { orderArray, count }) => {
  totalPages = count;
  document.querySelector("#current-page").innerText = pageNumber;
  const tableBody = document.querySelector("#all-order-table");
  tableBody.innerHTML = "";
  totalPages = Math.ceil(count / limit);
  if (pageNumber === 1)
    document.querySelector("#prev-button").style.pointerEvents = "none";
  else document.querySelector("#prev-button").style.pointerEvents = "auto";
  if (pageNumber === totalPages)
    document.querySelector("#next-button").style.pointerEvents = "none";
  else document.querySelector("#next-button").style.pointerEvents = "auto";
  orderArray.forEach((order) => {
    const settled = order.settled;
    var row = document.createElement("tr");
    row.innerHTML = `<tr>
      <td>${order.total + order.paid}</td>
      <td>${order.settled == 0 ? "Not settled" : "Settled"}</td>
      <td>${order.orderPlacedDate.toDateString()}</td>
      <td>${order.orderExpectedDate.toDateString()}</td>
      <td><a href="orderSpecific.html" class="transparent btn manage-button" id="${
        order.id
      }"><abbr title="View">📝</abbr></a></td></tr>`;
    if (settled) row.classList.add("grey-text");
    tableBody.appendChild(row);
  });
  manageFunction();
});

ipcRenderer.on("supplier-updated", () => {
  ipcRenderer.send("show-message", {
    heading: "Supplier updated",
    message: "Supplier details have been updated",
  });
  ipcRenderer.send("supplier-specific-window-loaded", supplierId);
  document.querySelector("#update-supplier-form-toggle").click();
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("supplier-specific-window-loaded", supplierId);
});
