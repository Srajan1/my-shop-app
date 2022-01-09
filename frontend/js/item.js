const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
var totalPages,
  perPage = 20,
  pageNumber = 1,
  where = {};

const manageFunction = () => {
  const manageButton = document.querySelectorAll('.manage-button')
  var i;
  for (i = 0; i < manageButton.length; i++) {
    manageButton[i].onclick = function () {
      sessionStorage.setItem("itemId", this.id);
    };
  }
};

ipcRenderer.on("item-metric-list-fetched", (event, data) => {
  document.querySelector("#current-page").innerText = pageNumber;
  metrics = data.metricArray;
  items = data.itemArray;
  const { itemCount } = data;
  totalPages = Math.ceil(itemCount / perPage);
  if (pageNumber === 1)
    document.querySelector("#prev-button").style.pointerEvents = "none";
  else document.querySelector("#prev-button").style.pointerEvents = "auto";
  if (pageNumber === totalPages)
    document.querySelector("#next-button").style.pointerEvents = "none";
  else document.querySelector("#next-button").style.pointerEvents = "auto";
  const dropdown = document.querySelector("#item-metric-dropdown");
  dropdown.innerHTML = "";
  metrics.forEach((metric) => {
    var optn = document.createElement("option");
    optn.setAttribute("value", metric.id);
    optn.innerText = metric.name;
    dropdown.appendChild(optn);
  });
  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
  items.forEach((item) => {
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${item.name}</td>
    <td>${item.Metric.dataValues.name}</td>
    <tr><td>${item.hsn}</td>
      <td>${item.available}</td>
      <td><a href="itemSpecific.html" class="transparent btn manage-button" id="${item.id}"><abbr title="View">📝</abbr></a></td></tr>`;
    tableBody.appendChild(row);
  });
  manageFunction();
});

ipcRenderer.on("item-added", (event) => {
  ipcRenderer.send('show-message', {heading: 'Item added', message: 'New item has been added'});
  ipcRenderer.send("item-window-loaded", { pageNumber, perPage, where });
});

const prevButton = document
  .querySelector("#prev-button")
  .addEventListener("click", () => {
    --pageNumber;

    ipcRenderer.send("item-window-loaded", { pageNumber, perPage, where });
  });

const nextButton = document
  .querySelector("#next-button")
  .addEventListener("click", () => {
    ++pageNumber;

    ipcRenderer.send("item-window-loaded", { pageNumber, perPage, where });
  });

document.querySelector("#add-form-toggle").addEventListener("click", () => {
  if (document.querySelector("#add-item-form").style.display == "none")
    document.querySelector("#add-item-form").style.display = "block";
  else document.querySelector("#add-item-form").style.display = "none";
});

document.querySelector("#filter-button").addEventListener("click", (e) => {
  e.preventDefault();
  const name = document.querySelector("#filter-item-input").value;
  if(name)
  where.name = name;
  const hsn = document.querySelector("#filter-hsn-input").value;
  if(hsn)
  where.hsn = hsn;
  ipcRenderer.send("item-window-loaded", { pageNumber, perPage, where });
});

document.querySelector("#filter-form-toggle").addEventListener("click", () => {
  if (document.querySelector("#filter-item-form").style.display == "none")
    document.querySelector("#filter-item-form").style.display = "block";
  else document.querySelector("#filter-item-form").style.display = "none";
});

const addItemButton = document.querySelector("#add-item-button");
addItemButton.addEventListener("click", (e) => {
  const itemName = document.querySelector("#item-name").value;
  const itemMetricId = document.querySelector("#item-metric-dropdown").value;
  const itemAvailable = document.querySelector("#item-available").value;
  const itemHsn = document.querySelector("#hsn").value;
  const item = {
    name: itemName,
    metricId: itemMetricId,
    hsn: itemHsn,
    available: itemAvailable,
  };
  ipcRenderer.send("add-item", item);
});

document.addEventListener("DOMContentLoaded", function () {
  ipcRenderer.send("item-window-loaded", { pageNumber, perPage, where });
});
