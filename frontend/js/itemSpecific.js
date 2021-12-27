const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const itemId = sessionStorage.getItem("itemId");

ipcRenderer.on('item-metric-list-fetched', (event, data) => {
  const {item, metric, metricArray} = data;
  console.log(item);
  const itemNameInput = document.querySelector('#item-name-input');
  itemNameInput.setAttribute('value', item.name);
  const itemInStock = document.querySelector('#item-in-stock');
  itemInStock.setAttribute('value', item.available);
  const dropdown = document.querySelector("#item-metric-dropdown");
  dropdown.innerHTML = "";
  metricArray.forEach((metric) => {
    var optn = document.createElement("option");
    optn.setAttribute("value", metric.id);
    optn.innerText = metric.name;
    dropdown.appendChild(optn);
  });
  document.querySelector("#item-metric-dropdown").value = metric.id;
})

ipcRenderer.on('item-updated', ()=>{
  alert('item has been updated');
})

document.querySelector('#update-item-button').addEventListener('click', () => {
  const itemName = document.querySelector('#item-name-input').value;
  const itemInStock = document.querySelector('#item-in-stock').value;
  const metric = document.querySelector("#item-metric-dropdown").value;
  const item = {
    name: itemName,
    available: itemInStock,
    metricId: metric
  }
  ipcRenderer.send('update-item', {itemId, item});
})

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("item-specific-window-loaded", itemId);
  });