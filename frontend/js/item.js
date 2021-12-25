const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
var totalPages, perPage = 20, pageNumber = 1;
ipcRenderer.on('item-metric-list-fetched', (event, data) => {
  document.querySelector('#current-page').innerText = pageNumber;
  metrics = data.metricArray;
  items = data.itemArray;
  const {itemCount} = data;
  totalPages = Math.ceil(itemCount / perPage);
  if(pageNumber === 1)
  document.querySelector('#prev-button').style.pointerEvents = "none";
  else document.querySelector('#prev-button').style.pointerEvents = "auto";
  if (pageNumber === totalPages) document.querySelector('#next-button').style.pointerEvents = "none";
  else document.querySelector('#next-button').style.pointerEvents = "auto";
    const dropdown = document.querySelector('#item-metric-dropdown');
    dropdown.innerHTML = '';
    metrics.forEach(metric => {
        
        var optn = document.createElement('option');
        optn.setAttribute('value', metric.id)
        optn.innerText = metric.name;
        dropdown.appendChild(optn);
    })
    const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
    items.forEach((item) => {
      var row = document.createElement("tr");
      row.innerHTML = `<tr><td>${item.name}</td>
      <td>${item.Metric.dataValues.name}</td>
      <td>${item.available}</td>
      <td><button class="transparent btn"  id="${item.id}_view"><abbr title="View">🔍</abbr></button></td>
      <td><button class="transparent btn"  id="${item.id}_edit"><abbr title="Edit">📝</abbr></button></td>
      <td><button class="transparent btn"  id="${item.id}_delete"><abbr title="Delete">❌</abbr></button></td></tr>`;
      tableBody.appendChild(row);
    });
})

ipcRenderer.on('item-added', (event) => {
  alert("New item has been added");
})

const prevButton = document.querySelector('#prev-button').addEventListener('click', () => {
  --pageNumber;
  ipcRenderer.send("item-window-loaded", {pageNumber, perPage});
})

const nextButton = document.querySelector('#next-button').addEventListener('click', () => {
  ++pageNumber;
  ipcRenderer.send("item-window-loaded", {pageNumber, perPage});
})

const addItemButton = document.querySelector('#add-item-button');
addItemButton.addEventListener('click', (e) => {
  const itemName = document.querySelector('#item-name').value;
  const itemMetricId = document.querySelector('#item-metric-dropdown').value;
  const itemAvailable = document.querySelector('#item-available').value;
  const item = {
    name: itemName,
    metricId: itemMetricId,
    available: itemAvailable
  };
  ipcRenderer.send('add-item', item);
})

document.addEventListener("DOMContentLoaded", function () {
  ipcRenderer.send("item-window-loaded", {pageNumber, perPage});

});
