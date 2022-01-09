const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const supplierId = sessionStorage.getItem("supplierId");

var fetchedData, totalPaid = 0;

document.querySelector("#add-history-button").addEventListener("click", (e) => {
  e.preventDefault();
  const paid = document.querySelector("#paid-amount").value;
  const date = document.querySelector("#paid-date").value;
  const paymentMode = document.querySelector("#payment-mode").value;
  if (!paid)
    ipcRenderer.send("error-occured", {
      heading: "Amount not found",
      message: "Please input the amount",
    });
  if (!date)
    ipcRenderer.send("error-occured", {
      heading: "Date not found",
      message: "Please input the Date",
    });
  const history = {
    paid,
    date,
    paymentMode,
    supplierId,
  };
  ipcRenderer.send("add-supplier-history", history);
});

ipcRenderer.on("supplier-transaction-added", () => {
  location.reload();
});

ipcRenderer.on("supplier-transaction-loaded", (event, data) => {
  fetchedData = data;
  document.querySelector(
    "#page-heading"
  ).innerText = `${fetchedData.supplier.name} has dealt total ₹${fetchedData.supplier.remainingBalance}`;
  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
  fetchedData.transactions.forEach((transaction) => {
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${transaction.paid}</td>
      <td>${transaction.date.toDateString()}</td>
      <td>${transaction.paid}</td>
      </tr>`;
      totalPaid+=transaction.paid;
    tableBody.appendChild(row);
  });
  document.querySelector('#paid-total').innerText = `You have paid total ₹${totalPaid}`;
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("supplier-transaction-window-loaded", supplierId);
});
