const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const orderId = sessionStorage.getItem("orderId");

var fetchedData;
var items = [],
  costPrice;

const makePaidZero = () => {
  document.querySelector("#money-paid").value = 0;
  document.querySelector("#total-order-value").value = null;
};

function convert(str) {
  var date = new Date(str),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
  return [date.getFullYear(), mnth, day].join("-");
}

const populateOrderData = (supplierArray) => {
  
  const dropdown = document.querySelector("#supplier-dropdown");
  supplierArray.forEach((supplier) => {
    var optn = document.createElement("option");
    optn.setAttribute("value", supplier.id);
    optn.innerText = supplier.name;
    dropdown.appendChild(optn);
  });
  dropdown.value = fetchedData.order.supplierId;
  document.querySelector('#page-heading').innerText = dropdown.options[dropdown.selectedIndex].innerHTML;
  if(fetchedData.order.settled === 0){
    document.querySelector('#settle-order').innerText = 'Mark as settled';
    document.querySelector('#settle-order').classList.add('blue-text');
  }else{
    document.querySelector('#settle-order').innerText = 'Mark as not settled';
    document.querySelector('#settle-order').classList.add('red-text');
  }
  document.querySelector("#expected-date-input").value = convert(
    fetchedData.order.orderExpectedDate
  );
  document.querySelector("#placed-date-input").value = convert(
    fetchedData.order.orderPlacedDate
  );
  document.querySelector("#money-paid").value = fetchedData.order.paid;
  document.querySelector("#total-order-value").value = fetchedData.order.total;
};

const populateItems = () => {
  const orderItemJunc = fetchedData.orderItemArray;
  
  orderItemJunc.forEach((orderItem) =>
    {
      addItemField(
        orderItem.itemId,
        orderItem.quantity,
        orderItem.price / orderItem.quantity,
        orderItem.price
      )
    }
  );
};

ipcRenderer.on("order-specific-data", (event, data) => {
  fetchedData = data;
  items = data.itemArray;
  costPrice = data.costPriceArray;
  const { supplierArray } = data;
  populateOrderData(supplierArray);
  populateItems();
});

const addItemField = (
  fetchedItem,
  fetchedQty,
  fetchedPricePerUnit,
  fetchedPrice
) => {
  const tableBody = document.querySelector("#table-body");
  var drp = document.createElement("select");
  drp.required = true;
  drp.setAttribute('value', '');
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
  if(fetchedItem)
  drp.value = fetchedItem;
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
    costPrice.forEach((item) => {
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
    document.querySelector("#total-order-value").value = total;
  };
  const quantityInput = document.createElement("input");
  quantityInput.required = true;
  quantityInput.classList.add("quantity-input");
  quantityInput.setAttribute("type", "number");
  quantityInput.setAttribute("placeholder", "Enter quantity");
  if(fetchedQty)
  quantityInput.value = fetchedQty;
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
    document.querySelector("#total-order-value").value = total;
  };
  const pricePerUnitInput = document.createElement("input");
  pricePerUnitInput.required = true;
  pricePerUnitInput.classList.add("price-per-unit-input");
  pricePerUnitInput.setAttribute("type", "number");
  pricePerUnitInput.setAttribute("placeholder", "price per unit");
  if(fetchedPricePerUnit)
  pricePerUnitInput.value = fetchedPricePerUnit;
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
    document.querySelector("#total-order-value").value = total;
  };
  const totalPrice = document.createElement("input");
  totalPrice.readOnly = true;
  totalPrice.setAttribute("placeholder", "total price");
  totalPrice.classList.add("price-value");
  totalPrice.setAttribute("type", "number");
  if(fetchedPrice)
  totalPrice.value = fetchedPrice;
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

document.querySelector("#money-paid").oninput = () => {
  const totalPrices = document.querySelectorAll(".price-value");
  var total = 0;
  totalPrices.forEach((price) => {
    total += parseInt(price.value);
  });
  document.querySelector("#total-order-value").value =
    total - document.querySelector("#money-paid").value;
};

document.querySelector("#add-another-item").addEventListener("click", (e) => {
  e.preventDefault();
  addItemField();
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("order-specific-window-loaded", orderId);
});

document.querySelector("#update-the-order").addEventListener("click", (e) => {
  e.preventDefault();
  const supplier = document.querySelector("#supplier-dropdown").value;
  if (!supplier)
    ipcRenderer.send("error-occured", {
      heading: "Supplier not found",
      message: "Please select a supplier",
    });
  const items = document.querySelectorAll(".item-dropdown");
  items.forEach((item) => {
    if (!item.value || item.value === "Choose an item")
      ipcRenderer.send("error-occured", {
        heading: "Item not found",
        message: "Make sure items are selected",
      });
  });
  const quantities = document.querySelectorAll(".quantity-input");
  quantities.forEach((quantity) => {
    if (!quantity.value)
      ipcRenderer.send("error-occured", {
        heading: "Quantity not found",
        message: "Please mention all quantities",
      });
  });
  const pricePerUnitInput = document.querySelectorAll(".price-per-unit-input");
  pricePerUnitInput.forEach((price) => {
    if (!price.value)
      ipcRenderer.send("error-occured", {
        heading: "Price per unit not found",
        message: "Please mention all price per unit",
      });
  });
  sendData();
});

const sendData = () => {
  const total = document.querySelector("#total-order-value").value;
  const paid = document.querySelector("#money-paid").value;
  const orderExpectedDate = document.querySelector("#expected-date-input").value;
  const orderPlacedDate = document.querySelector("#placed-date-input").value;
  const supplierId =  document.querySelector('#supplier-dropdown').value;
  const order = {
    total, 
    paid, 
    orderExpectedDate, 
    orderPlacedDate,
    supplierId
  };
  const itemList = document.querySelectorAll(".item-list");
  const allItems = [];
  itemList.forEach((item) => {
    const itemId = item.children[0].value;
    const quantity = item.children[1].children[0].value;
    const price = item.children[3].children[0].value;
    allItems.push({ itemId, quantity, price, orderId });
  });
  ipcRenderer.send('update-order', {allItems, order, orderId});
};

document.querySelector('#settle-order').addEventListener('click', () => {
  var newValue = 1;
  if(fetchedData.order.settled === 1)
    newValue = 0;
  ipcRenderer.send('mark-as-settled', {orderId, newValue});
})

ipcRenderer.on('order-updated', (event) => {
  location.reload();
})