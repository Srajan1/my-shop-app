const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const itemId = sessionStorage.getItem("itemId");
var   limit = 20,
pageNumber = 1,
totalPages;
document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('item-sales-loaded', {itemId, pageNumber, limit})
})

document.querySelector("#prev-button").addEventListener("click", () => {
    --pageNumber;
    ipcRenderer.send("item-sales-loaded", { itemId, pageNumber, limit });
  });
  
  document.querySelector("#next-button").addEventListener("click", () => {
    ++pageNumber;
  
    ipcRenderer.send("item-sales-loaded", { itemId, pageNumber, limit });
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

ipcRenderer.on('item-sales-fetched', (event, data) => {
    document.querySelector('#current-page').innerText = pageNumber
    const tableBody = document.querySelector("#table-body");
    tableBody.innerHTML = "";
    totalPages = Math.ceil(data.count/limit);
    if (pageNumber === 1)
      document.querySelector("#prev-button").style.pointerEvents = "none";
    else document.querySelector("#prev-button").style.pointerEvents = "auto";
    if (pageNumber === totalPages)
      document.querySelector("#next-button").style.pointerEvents = "none";
    else document.querySelector("#next-button").style.pointerEvents = "auto";
    data.completeData.forEach((saleCustomer) => {
      const settled = saleCustomer.Sale.settled;
      var row = document.createElement("tr");
      row.innerHTML = `<tr><td>${saleCustomer.Customer.name}</td>
        <td>${saleCustomer.Sale.total}</td>
        <td>${settled == 0 ? "Not settled" : "Settled"}</td>
        <td>${saleCustomer.Sale.date.toDateString()}</td>
        <td><a href="saleSpecific.html" class="transparent btn manage-button" id="${
            saleCustomer.Sale.id
        }"><abbr title="View">📝</abbr></a></td></tr>`;
      if (settled) row.classList.add("grey-text");
      tableBody.appendChild(row);
    });
    manageFunction();
})