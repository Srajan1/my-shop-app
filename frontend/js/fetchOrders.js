const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

const where = {},
  limit = 20,
  page = 1;

  const manageFunction = () => {
    const manageButton = document.querySelectorAll('.manage-button')
    var i;
    for (i = 0; i < manageButton.length; i++) {
      manageButton[i].onclick = function () {
        sessionStorage.setItem("orderId", this.id);
      };
    }
  };

const showOrders = () => {
  document.querySelector("form").style.display = "none";
  document.querySelector("#order-table").style.visibility = "visible";
  ipcRenderer.send("fetch-all-orders", { where, limit, page });
};

ipcRenderer.on("orders-fetched", (event, data) => {
  const tableBody = document.querySelector("#all-order-table");
  tableBody.innerHTML = "";
  data.forEach((order) => {
    const settled = order.settled;
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${order.Supplier.dataValues.name}</td>
      <td>${order.total}</td>
      <td>${order.paid}</td>
      <td>${order.total + order.paid}</td>
      <td>${order.settled == 0 ? 'Not settled' : 'Settled'}</td>
      <td>${order.orderPlacedDate.toDateString()}</td>
      <td>${order.orderExpectedDate.toDateString()}</td>
      <td><a href="orderSpecific.html" class="transparent btn manage-button" id="${order.id}"><abbr title="View">📝</abbr></a></td></tr>`;
      if(settled)
      row.classList.add('grey-text')
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
