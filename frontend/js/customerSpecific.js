const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const customerId = sessionStorage.getItem("customerId");
var fetchedData, totalPages;
var limit = 20,
  pageNumber = 1;
document
  .querySelector("#update-customer-form-toggle")
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
      sessionStorage.setItem("saleId", this.id);
    };
  }
};

document.querySelector("#prev-button").addEventListener("click", () => {
  --pageNumber;
  ipcRenderer.send("fetch-sale-for-customer", {
    customerId,
    limit,
    pageNumber,
  });
});

document.querySelector("#next-button").addEventListener("click", () => {
  ++pageNumber;
  ipcRenderer.send("fetch-sale-for-customer", {
    customerId,
    limit,
    pageNumber,
  });
});

document.querySelector("#update-details").addEventListener("click", () => {
  const customerName = document.querySelector("#customer-name").value;
  const customerPhone = document.querySelector("#customer-phone-number").value;
  const customerAddress = document.querySelector("#customer-address").value;
  const customerDescription = document.querySelector(
    "#customer-description"
  ).value;
  const customer = {};
  if (customerName !== "") customer.name = customerName;
  if (customerPhone !== "") customer.phoneNumber = customerPhone;
  if (customerAddress !== "") customer.address = customerAddress;
  if (customerDescription !== "") customer.description = customerDescription;
  ipcRenderer.send("update-customer", { customer, customerId });
});

ipcRenderer.on("customer-data-fetched", (event, data) => {
  fetchedData = data;
  document.querySelector("#page-heading").innerText = fetchedData.name;
  document.querySelector("#customer-name").value = fetchedData.name;
  document.querySelector("#customer-phone-number").value =
    fetchedData.phoneNumber;
  document.querySelector("#customer-address").value = fetchedData.address;
  document.querySelector("#customer-description").value =
    fetchedData.description;
  ipcRenderer.send("fetch-sale-for-customer", {
    customerId,
    limit,
    pageNumber,
  });
});

ipcRenderer.on("sale-fetched-for-customer", (event, { saleArray, count }) => {
  totalPages = count;
  document.querySelector("#current-page").innerText = pageNumber;
  const tableBody = document.querySelector("#all-sale-table");
  tableBody.innerHTML = "";
  totalPages = Math.ceil(count / limit);
  if (pageNumber === 1)
    document.querySelector("#prev-button").style.pointerEvents = "none";
  else document.querySelector("#prev-button").style.pointerEvents = "auto";
  if (pageNumber === totalPages)
    document.querySelector("#next-button").style.pointerEvents = "none";
  else document.querySelector("#next-button").style.pointerEvents = "auto";
  saleArray.forEach((sale) => {
    const settled = sale.settled;
    var row = document.createElement("tr");
    row.innerHTML = `<tr>
      <td>${sale.total}</td>
      <td>${sale.paid}</td>
      <td>${sale.total + sale.paid}</td>
      <td>${sale.settled == 0 ? "Not settled" : "Settled"}</td>
      <td>${sale.salePlacedDate.toDateString()}</td>
      <td>${sale.saleExpectedDate.toDateString()}</td>
      <td><a href="saleSpecific.html" class="transparent btn manage-button" id="${
        sale.id
      }"><abbr title="View">📝</abbr></a></td></tr>`;
    if (settled) row.classList.add("grey-text");
    tableBody.appendChild(row);
  });
  manageFunction();
});

ipcRenderer.on("customer-updated", () => {
  ipcRenderer.send("show-message", {
    heading: "Supplier updated",
    message: "Supplier details have been updated",
  });
  ipcRenderer.send("customer-specific-window-loaded", customerId);
  document.querySelector("#update-customer-form-toggle").click();
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("customer-specific-window-loaded", customerId);
});
