const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const supplierId = sessionStorage.getItem("supplierId");
const convertJsonToExcel = require('../partials/generateExcel');

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
  else if (!date)
    ipcRenderer.send("error-occured", {
      heading: "Date not found",
      message: "Please input the Date",
    });else{
      
  const history = {
    paid,
    date,
    paymentMode,
    supplierId,
  };
  ipcRenderer.send("add-supplier-history", history);
    }
});

ipcRenderer.on("supplier-transaction-added", () => {
  location.reload();
});

document.querySelector('#download-excel').addEventListener('click', () => {
  const excelArray = [];
  fetchedData.transactions.forEach(trans => {
    const transaction = {};
    transaction.name = fetchedData.supplier.name;
    transaction.phoneNumber = fetchedData.supplier.phoneNumber;
    transaction.paid = trans.paid;
    transaction.date = trans.date.toDateString();
    transaction.paymentMode = trans.paymentMode;
    excelArray.push(transaction);
  })
  convertJsonToExcel(excelArray);
})

const manageFunction = () => {
  const deleteButton = document.querySelectorAll('.delete-button');
  for(var i = 0; i<deleteButton.length ;++i){
    deleteButton[i].onclick = function(e) {
      ipcRenderer.send('delete-supplier-transaction', {transactionId: e.target.id})
    }
  }
}

document.querySelector('#add-history').addEventListener('click', () => {
  if(document.querySelector('#add-history-form').style.display === 'none')
  document.querySelector('#add-history-form').style.display = 'block';
  else document.querySelector('#add-history-form').style.display = 'none'
})

ipcRenderer.on("supplier-transaction-loaded", (event, data) => {
  fetchedData = data;
  document.querySelector(
    "#page-heading"
  ).innerText = `${fetchedData.supplier.name} has sold to you total ₹${fetchedData.supplier.totalDeal}`;
  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
  fetchedData.transactions.forEach((transaction) => {
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${transaction.paid}</td>
      <td>${transaction.date.toDateString()}</td>
      <td>${transaction.paymentMode}</td>
      <td><a href="#" class="transparent btn delete-button"  id="${transaction.id}">❌</a></td>
      </tr>`;
      totalPaid+=transaction.paid;
    tableBody.appendChild(row);
  });
  document.querySelector('#paid-total').innerText = `You have paid total ₹${totalPaid}`;
  manageFunction();
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("supplier-transaction-window-loaded", supplierId);
});
