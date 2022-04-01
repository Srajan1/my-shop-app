const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const itemId = sessionStorage.getItem("itemId");
var   limit = 20,
pageNumber = 1,
totalPages;
const manageFunction = () => {
    const manageButton = document.querySelectorAll(".manage-button");
    var i;
    for (i = 0; i < manageButton.length; i++) {
      manageButton[i].onclick = function () {
        sessionStorage.setItem("orderId", this.id);
      };
    }
  };
document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('item-orders-loaded', {itemId, pageNumber, limit});
})

document.querySelector("#prev-button").addEventListener("click", () => {
    --pageNumber;
    ipcRenderer.send("item-orders-loaded", { itemId, pageNumber, limit });
  });
  
  document.querySelector("#next-button").addEventListener("click", () => {
    ++pageNumber;
  console.log('clicked');
    ipcRenderer.send("item-orders-loaded", { itemId, pageNumber, limit });
  });
  

ipcRenderer.on('item-orders-fetched', (event, data) => {
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
    data.completeData.forEach((orderSupplier) => {
      const settled = orderSupplier.Order.settled;
      var row = document.createElement("tr");
      row.innerHTML = `<tr><td>${orderSupplier.Supplier.name}</td>
        <td>${orderSupplier.Order.total}</td>
        <td>${settled == 0 ? "Not settled" : "Settled"}</td>
        <td>${orderSupplier.Order.date.toDateString()}</td>
        <td><a href="orderSpecific.html" class="transparent btn manage-button" id="${
            orderSupplier.Order.id
        }"><abbr title="View">📝</abbr></a></td></tr>`;
      if (settled) row.classList.add("grey-text");
      tableBody.appendChild(row);
    });
    manageFunction();
})