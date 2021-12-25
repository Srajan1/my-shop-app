const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on('item-metric-list-fetched', (event, data) => {
  metrics = data.metricArray;
  items = data.itemArray;
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
  ipcRenderer.send("item-window-loaded");

});
