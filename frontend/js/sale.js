const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
var items = [],
  sellingPrice;

const makePaidZero = () => {
  document.querySelector("#total-sale-value").value = null;
};

const addItemField = () => {
  const tableBody = document.querySelector("#table-body");
  var drp = document.createElement("select");
  drp.required = true;
  drp.classList.add("browser-default");
  drp.classList.add("item-dropdown");
  const disabledDrp = document.createElement("option");
  disabledDrp.disabled = "true";
  disabledDrp.setAttribute("selected", true);
  disabledDrp.innerHTML = "Choose an item";
  drp.appendChild(disabledDrp);
  items.forEach((item) => {
    var optn = document.createElement("option");
    optn.setAttribute("value", item.id);
    optn.innerText = `${item.name}`;
    drp.appendChild(optn);
  });
  drp.onchange = (e) => {
    makePaidZero();
    const itemId = e.target.value;
    const pricePerUnitEle =
      e.target.nextElementSibling.nextElementSibling.children[0];
    e.target.nextElementSibling.nextElementSibling.nextElementSibling.children[0].value =
      null;
    e.target.nextElementSibling.children[0].value = null;
    var price;
    var isPresent = 0;
    sellingPrice.forEach((item) => {
      if (item.itemId == itemId) {
        price = item.price;
        isPresent = 1;
      }
    });
    if (isPresent) {
      pricePerUnitEle.value = price;
    } else {
      pricePerUnitEle.value = null;
      pricePerUnitEle.setAttribute(
        "placeholder",
        "No price found, please add price"
      );
    }
  };
  const removeButton = document.createElement("button");
  removeButton.classList.add("transparent");
  removeButton.classList.add("btn");
  removeButton.innerHTML = "❌";
  removeButton.onclick = function (e) {
    makePaidZero();
    e.preventDefault();
    e.target.parentElement.parentElement.remove();
    const totalPrices = document.querySelectorAll(".price-value");
    var total = 0;
    totalPrices.forEach((price) => {
      total += parseInt(price.value);
    });
    document.querySelector("#total-sale-value").value = total;
  };
  const quantityInput = document.createElement("input");
  quantityInput.required = true;
  quantityInput.classList.add("quantity-input");
  quantityInput.setAttribute("type", "number");
  quantityInput.setAttribute("placeholder", "Enter quantity");
  quantityInput.oninput = (e) => {
    makePaidZero();
    const totalPriceEle =
      e.target.parentElement.nextElementSibling.nextElementSibling.children[0];
    const pricePerUnit =
      e.target.parentElement.nextElementSibling.children[0].value;
    totalPriceEle.value = pricePerUnit * e.target.value;
    const totalPrices = document.querySelectorAll(".price-value");
    var total = 0;
    totalPrices.forEach((price) => {
      total += parseInt(price.value);
    });
    document.querySelector("#total-sale-value").value = total;
  };
  const pricePerUnitInput = document.createElement("input");
  pricePerUnitInput.required = true;
  pricePerUnitInput.classList.add("price-per-unit-input");
  pricePerUnitInput.setAttribute("type", "number");
  pricePerUnitInput.setAttribute("placeholder", "price per unit");
  pricePerUnitInput.oninput = (e) => {
    makePaidZero();
    const totalPriceEle = e.target.parentElement.nextElementSibling.children[0];
    const quantity =
      e.target.parentElement.previousElementSibling.children[0].value;
    totalPriceEle.value = e.target.value * quantity;
    const totalPrices = document.querySelectorAll(".price-value");
    var total = 0;
    totalPrices.forEach((price) => {
      total += parseInt(price.value);
    });
    document.querySelector("#total-sale-value").value = total;
  };
  const totalPrice = document.createElement("input");
  totalPrice.readOnly = true;
  totalPrice.setAttribute("placeholder", "total price");
  totalPrice.classList.add("price-value");
  totalPrice.setAttribute("type", "number");

  drp.style.marginTop = 15;
  var row = document.createElement("tr");
  row.appendChild(drp);
  const td1 = document.createElement("td");
  td1.appendChild(quantityInput);
  row.appendChild(td1);
  const td2 = document.createElement("td");
  td2.appendChild(pricePerUnitInput);
  row.appendChild(td2);
  const td3 = document.createElement("td");
  td3.appendChild(totalPrice);
  row.appendChild(td3);
  const td4 = document.createElement("td");
  td4.appendChild(removeButton);
  row.appendChild(td4);
  row.classList.add("item-list");
  tableBody.appendChild(row);
};

document.querySelector("#add-another-item").addEventListener("click", (e) => {
  e.preventDefault();
  addItemField();
});


const populateCustomers = (customerArray) => {
  const dropdown = document.querySelector("#customer-dropdown");
  dropdown.id = "customer-dropdown";
  dropdown.innerHTML = "";
  customerArray.forEach((customer) => {
    var optn = document.createElement("option");
    optn.setAttribute("value", customer.id);
    optn.innerText = customer.name;
    dropdown.appendChild(optn);
  });
};

document.querySelector("#place-the-sale").addEventListener("click", (e) => {
  e.preventDefault();
  var error = 0;
  const customer = document.querySelector("#customer-dropdown").value;
  if (!customer){
    ipcRenderer.send("error-occured", {
      heading: "Customer not found",
      message: "Please select a customer",
    });
    error = 1;
  }
  const items = document.querySelectorAll(".item-dropdown");
  items.forEach((item) => {
    if (!item.value || item.value === "Choose an item"){
      ipcRenderer.send("error-occured", {
        heading: "Item not found",
        message: "Make sure items are selected",
      });
      error = 1;
    }
  });
  const quantities = document.querySelectorAll(".quantity-input");
  quantities.forEach((quantity) => {
    if (!quantity.value){
      ipcRenderer.send("error-occured", {
        heading: "Quantity not found",
        message: "Please mention all quantities",
      });
      error = 1;
    }
  });
  const pricePerUnitInput = document.querySelectorAll(".price-per-unit-input");
  pricePerUnitInput.forEach((price) => {
    if (!price.value){
      ipcRenderer.send("error-occured", {
        heading: "Price per unit not found",
        message: "Please mention all price per unit",
      });
      error = 1;
    }
  });
  if(error === 0)
  sendData();
});

ipcRenderer.on("customer-item-fetched", (event, data) => {
  items = data.itemArray;
  sellingPrice = data.sellingPriceArray;
  const { customerArray } = data;
  populateCustomers(customerArray);
  addItemField();
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("sale-window-loaded");
});

const sendData = () => {
  const total = document.querySelector("#total-sale-value").value;
  const salePlacedDate = document.querySelector("#placed-date-input").value;
  const customerId =  document.querySelector('#customer-dropdown').value;
  const sale = {
    total, 
    salePlacedDate,
    customerId
  };
  const itemList = document.querySelectorAll(".item-list");
  const allItems = [];
  itemList.forEach((item) => {
    const itemId = item.children[0].value;
    const quantity = item.children[1].children[0].value;
    const price = item.children[3].children[0].value;
    allItems.push({ itemId, quantity, price });
  });
  ipcRenderer.send('place-sale', {allItems, sale});
};

ipcRenderer.on('sale-placed', () => {
  document.querySelector('#view-sale-toggle').click();
})