const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const itemId = sessionStorage.getItem("itemId");
const limit = 20,
  page = 1;

ipcRenderer.on("item-metric-list-fetched", (event, data) => {
  document.getElementById("save-cost-price").disabled = false;
  document.getElementById("save-selling-price").disabled = false;
  const { item, metric, metricArray } = data;
  document.querySelector("#heading").innerText = item.name;
  const itemNameInput = document.querySelector("#item-name-input");
  itemNameInput.setAttribute("value", item.name);
  const itemInStock = document.querySelector("#item-in-stock");
  itemInStock.setAttribute("value", item.available);
  const dropdown = document.querySelector("#item-metric-dropdown");
  dropdown.innerHTML = "";
  metricArray.forEach((metric) => {
    var optn = document.createElement("option");
    optn.setAttribute("value", metric.id);
    optn.innerText = metric.name;
    dropdown.appendChild(optn);
  });
  ipcRenderer.send("fetch-prices", { itemId, limit, page });
  document.querySelector("#item-metric-dropdown").value = metric.id;
});

ipcRenderer.on("prices-fetched", (event, data) => {
  const costPrices = data.costPrices;
  const sellingPrices = data.sellingPrices;
  if (costPrices.length === 0) {
    const tableBody = document.querySelector("#cost-price-body");
    tableBody.innerHTML = "";
    var date = new Date();
    var row = document.createElement("tr");
      row.innerHTML = `<tr><td>Today</td>
      <td>Until next change</td>
      <td><input type="number" placeholder="enter price" id="new-cost-price"></td></tr>`;
      tableBody.appendChild(row);
  } else {
    const tableBody = document.querySelector("#cost-price-body");
    tableBody.innerHTML = "";
    var lastToDate;
    lastToDate = costPrices[costPrices.length-1].dataValues.toDate;
    var date = new Date();
    var row = document.createElement("tr");
      row.innerHTML = `<tr><td>Today</td>
      <td>Until next change</td>
      <td><input type="number" placeholder="enter price" id="new-cost-price"></td></tr>`;
      tableBody.appendChild(row);
    costPrices.forEach((costPrice) => {
      // if(!costPrice.dataValues.toDate){
      //   costPrice.dataValues.toDate = new Date()
      //   console.log(costPrice.dataValues.toDate);
      // }
      var row = document.createElement("tr");
      row.innerHTML = `<tr><td>${costPrice.dataValues.fromDate.toDateString()}</td>
      <td>${costPrice.dataValues.toDate ? costPrice.dataValues.toDate.toDateString() : 'Current Price'}</td>
      <td>${costPrice.dataValues.price}</td></tr>`;
      tableBody.appendChild(row);
    });
    
  }
  if (sellingPrices.length === 0) {
    const tableBody = document.querySelector("#selling-price-body");
    tableBody.innerHTML = "";
    var date = new Date();
    var row = document.createElement("tr");
      row.innerHTML = `<tr><td id="from-selling-date">Today</td>
      <td id="to-selling-date">Until next change</td>
      <td><input type="number" placeholder="enter price" id="new-selling-price"></td></tr>`;
      tableBody.appendChild(row);
  } else {
    var lastToDate;
    lastToDate = sellingPrices[sellingPrices.length-1].dataValues.toDate;
    const tableBody = document.querySelector("#selling-price-body");
    tableBody.innerHTML = "";
    var date = new Date();
    var row = document.createElement("tr");
      row.innerHTML = `<tr><td>Today</td>
      <td>Until next change</td>
      <td><input type="number" placeholder="enter price" id="new-selling-price"></td></tr>`;
      tableBody.appendChild(row);
    sellingPrices.forEach((sellingPrice) => {
      // if(!sellingPrice.dataValues.toDate){
      //   sellingPrice.dataValues.toDate = new Date()
      //   console.log(sellingPrice.dataValues.toDate);
      // }
      var row = document.createElement("tr");
      row.innerHTML = `<tr><td>${sellingPrice.dataValues.fromDate.toDateString()}</td>
      <td>${sellingPrice.dataValues.toDate ? sellingPrice.dataValues.toDate.toDateString() : 'Current Price'}</td>
      <td>${sellingPrice.dataValues.price}</td></tr>`;
      tableBody.appendChild(row);
    });
  }
});

ipcRenderer.on("item-updated", () => {
  ipcRenderer.send('show message', {heading: 'Item updated', message: 'Item has been updated'})
});

document.querySelector('#save-selling-price').addEventListener('click', () => {
  const price = document.querySelector('#new-selling-price').value;
  const sellingPrice = {
    fromDate: Date.now(),
    price,
    itemId
  };
  document.getElementById("save-selling-price").disabled = true;
  ipcRenderer.send('save-selling-price', {sellingPrice, itemId});
  ipcRenderer.send("item-specific-window-loaded", itemId);
})

document.querySelector('#save-cost-price').addEventListener('click', () => {
  const price = document.querySelector('#new-cost-price').value;
  const costPrice = {
    fromDate: Date.now(),
    price,
    itemId
  };
  document.getElementById("save-cost-price").disabled = true;
  ipcRenderer.send('save-cost-price', {costPrice, itemId});
  ipcRenderer.send("item-specific-window-loaded", itemId);
})

document.querySelector("#update-item-button").addEventListener("click", () => {
  const itemName = document.querySelector("#item-name-input").value;
  const itemInStock = document.querySelector("#item-in-stock").value;
  const metric = document.querySelector("#item-metric-dropdown").value;
  const item = {
    name: itemName,
    available: itemInStock,
    metricId: metric,
  };
  ipcRenderer.send("update-item", { itemId, item });
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("item-specific-window-loaded", itemId);
});
