const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const customerId = sessionStorage.getItem("customerId");
const convertJsonToExcel = require('../partials/generateExcel');

var fetchedData, totalPaid = 0, totalBorrowed = 0;

document.querySelector("#add-history-button").addEventListener("click", (e) => {
  e.preventDefault();
  
  var paid = document.querySelector("#paid-amount").value;
  const date = document.querySelector("#paid-date").value;
  const paymentMode = document.querySelector("#payment-mode").value;
  if (!paid)
    ipcRenderer.send("error-occured", {
      heading: "Amount not found",
      message: "Please input the amount",
    });
  else if (!date)
    ipcRenderer.send("error-occured", {
      heading: "Date not found",
      message: "Please input the Date",
    });
    else {
      if(document.querySelector('#inDebt').checked)
      paid *= -1;
  const history = {
    paid,
    date,
    paymentMode,
    customerId,
  };
  ipcRenderer.send("add-customer-history", history);}
});

ipcRenderer.on("customer-transaction-added", () => {
  location.reload();
});

document.querySelector('#download-excel').addEventListener('click', () => {
  const excelArray = [];
  fetchedData.transactions.forEach(trans => {
    const transaction = {};
    transaction.name = fetchedData.customer.name;
    transaction.phoneNumber = fetchedData.customer.phoneNumber;
    transaction.paid = trans.paid;
    transaction.date = trans.date.toDateString();
    transaction.paymentMode = trans.paymentMode;
    excelArray.push(transaction);
  })
  convertJsonToExcel(excelArray);
})

document.querySelector('#add-history').addEventListener('click', () => {
  if(document.querySelector('#add-history-form').style.display === 'none')
  document.querySelector('#add-history-form').style.display = 'block';
  else document.querySelector('#add-history-form').style.display = 'none'
})

ipcRenderer.on("customer-transaction-loaded", (event, data) => {
  
  fetchedData = data;
  console.log(fetchedData);
  
  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
  fetchedData.transactions.forEach((transaction) => {
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${transaction.paid}</td>
      <td>${transaction.date.toDateString()}</td>
      <td>${transaction.paymentMode}</td>
      </tr>`;
      if(transaction.paid > 0)
      totalPaid+=transaction.paid;
      else totalBorrowed -= transaction.paid
    tableBody.appendChild(row);
  });
  document.querySelector(
    "#page-heading"
  ).innerText = `${fetchedData.customer.name} has borrowed total ₹${totalBorrowed}`;
  document.querySelector('#paid-total').innerText = `${fetchedData.customer.name} has paid total ₹${totalPaid}`;
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("customer-transaction-window-loaded", customerId);
});
