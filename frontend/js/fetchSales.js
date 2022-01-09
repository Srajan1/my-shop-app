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
      sessionStorage.setItem("saleId", this.id);
    };
  }
};

document.querySelector('#settled-sale-view').addEventListener('click', (e) => {
  e.preventDefault();
  if(e.target.innerText === 'SHOW ONLY PENDING SALES'){
    where = {settled: 0}
    ipcRenderer.send("fetch-all-sales", { where, limit, pageNumber });
    e.target.innerText = 'SHOW ALL SALES'
  }else{
    where = {}
    ipcRenderer.send("fetch-all-sales", { where, limit, pageNumber });
    e.target.innerText = 'SHOW ONLY PENDING SALES'
  }
  
})

const showSales = () => {
  document.querySelector("form").style.display = "none";
  document.querySelector("#sale-table").style.visibility = "visible";
  ipcRenderer.send("fetch-all-sales", { where, limit, pageNumber });
};

ipcRenderer.on("sales-fetched", (event, data) => {
  document.querySelector('#current-page').innerText = pageNumber
  const tableBody = document.querySelector("#all-sale-table");
  tableBody.innerHTML = "";
  totalPages = Math.ceil(data.count/limit);
  if (pageNumber === 1)
    document.querySelector("#prev-button").style.pointerEvents = "none";
  else document.querySelector("#prev-button").style.pointerEvents = "auto";
  if (pageNumber === totalPages)
    document.querySelector("#next-button").style.pointerEvents = "none";
  else document.querySelector("#next-button").style.pointerEvents = "auto";
  data.saleArray.forEach((sale) => {
    const settled = sale.settled;
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${sale.Customer.dataValues.name}</td>
      <td>${sale.total}</td>
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

const hideSales = () => {
  document.querySelector("form").style.display = "block";
  document.querySelector("#sale-table").style.visibility = "hidden";
};

document.querySelector("#view-sale-toggle").addEventListener("click", () => {
  const formStyle = document.querySelector("form").style.display;
  if (formStyle == "none") {hideSales(); document.querySelector('#view-sale-toggle').innerText = 'View all sales';}
  else {showSales(); document.querySelector('#view-sale-toggle').innerText = 'Add a sale';}
});

document.querySelector("#prev-button").addEventListener("click", () => {
  --pageNumber;
  ipcRenderer.send("fetch-all-sales", { where, limit, pageNumber });
});

document.querySelector("#next-button").addEventListener("click", () => {
  ++pageNumber;

  ipcRenderer.send("fetch-all-sales", { where, limit, pageNumber });
});
