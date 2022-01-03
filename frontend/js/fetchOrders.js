const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

var where = {},
  limit = 20,
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

document.querySelector('#settled-order-view').addEventListener('click', (e) => {
  e.preventDefault();
  if(e.target.innerText === 'SHOW ONLY PENDING ORDERS'){
    where = {settled: 0}
    ipcRenderer.send("fetch-all-orders", { where, limit, pageNumber });
    e.target.innerText = 'SHOW ALL ORDERS'
  }else{
    where = {}
    ipcRenderer.send("fetch-all-orders", { where, limit, pageNumber });
    e.target.innerText = 'SHOW ONLY PENDING ORDERS'
  }
  
})

const showOrders = () => {
  document.querySelector("form").style.display = "none";
  document.querySelector("#order-table").style.visibility = "visible";
  ipcRenderer.send("fetch-all-orders", { where, limit, pageNumber });
};

ipcRenderer.on("orders-fetched", (event, data) => {
  document.querySelector('#current-page').innerText = pageNumber
  const tableBody = document.querySelector("#all-order-table");
  tableBody.innerHTML = "";
  totalPages = Math.ceil(data.count/limit);
  if (pageNumber === 1)
    document.querySelector("#prev-button").style.pointerEvents = "none";
  else document.querySelector("#prev-button").style.pointerEvents = "auto";
  if (pageNumber === totalPages)
    document.querySelector("#next-button").style.pointerEvents = "none";
  else document.querySelector("#next-button").style.pointerEvents = "auto";
  data.orderArray.forEach((order) => {
    const settled = order.settled;
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${order.Supplier.dataValues.name}</td>
      <td>${order.total}</td>
      <td>${order.paid}</td>
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

const hideOrders = () => {
  document.querySelector("form").style.display = "block";
  document.querySelector("#order-table").style.visibility = "hidden";
};

document.querySelector("#view-order-toggle").addEventListener("click", () => {
  const formStyle = document.querySelector("form").style.display;
  if (formStyle == "none") hideOrders();
  else showOrders();
});

document.querySelector("#prev-button").addEventListener("click", () => {
  --pageNumber;
  ipcRenderer.send("fetch-all-orders", { where, limit, pageNumber });
});

document.querySelector("#next-button").addEventListener("click", () => {
  ++pageNumber;

  ipcRenderer.send("fetch-all-orders", { where, limit, pageNumber });
});
