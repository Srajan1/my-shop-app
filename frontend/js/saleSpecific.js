const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const saleId = sessionStorage.getItem("saleId");
const myCompany = JSON.parse(sessionStorage.getItem('myCompany'));
const generateInvoice = require("../partials/invoiceGenerator");
console.log(myCompany.name);
var fetchedData;
var items = [],
  sellingPrice;
var products = [];
var customerData = {};

const makePaidZero = () => {
  document.querySelector("#total-sale-value").value = null;
};

function convert(str) {
  var date = new Date(str),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
  return [date.getFullYear(), mnth, day].join("-");
}

ipcRenderer.on('pakka-sold-items-fetched', (event, itemList) => {
  const data = {};
  const date = new Date();
  data.sender = {
    company: myCompany.companyName,
    address: myCompany.address,
    city: myCompany.city,
    country: myCompany.state,
    zip: 261001,
    custom1: `Phone ${myCompany.phoneNumber1}`,
    custom3: `GSTIN ${myCompany.GSTIN}`
  };
  if(myCompany.phoneNumber2){
    data.sender.custom2 = `Phone ${myCompany.phoneNumber2}`
  }
  data.client = {
    company: `${customerData.name}`,
    address: `${customerData.address}`,
    zip: customerData.pinCode,
    city: customerData.city,
    country: customerData.state,
    custom1: `GSTIN ${customerData.gst}`
  };
  data.invoiceNumber = fetchedData.sale.id.toString()+ '_' + date.toLocaleString().split(',')[0].toString()
  data.invoiceDate = fetchedData.sale.salePlacedDate.toLocaleString().split(',')[0]
  data.products = itemList;
  data.settings = {
    "currency": "INR",
    "tax-notation": "gst"
  };

  var name = fetchedData.sale.id.toString()+ '_' + date.toLocaleString().toString() + '.pdf';
  generateInvoice(data, name);
})

document.querySelector('#show-invoice-form').addEventListener('click', () => {
  if(document.querySelector('#invoice-data').style.display === 'none')
  document.querySelector('#invoice-data').style.display = 'block';
  else document.querySelector('#invoice-data').style.display = 'none'
})

document.querySelector('#generate-pakka-invoice').addEventListener('click', (e) => {
  e.preventDefault();
  const gstValue = document.querySelector('#gst-percent').value;
  if(!gstValue)
  ipcRenderer.send("error-occured", {
    heading: "GST Value not found",
    message: "Please enter GST Value",
  });
  else{
    ipcRenderer.send('fetch-pakka-sold-item-data', ({saleId, gstValue}))
  }
  

})

document.querySelector("#print-kachcha-invoice").addEventListener("click", (e) => {
  e.preventDefault();
  const data = {};
  const date = new Date();
  data.sender = {
    company: myCompany.companyName,
    address: myCompany.address,
    city: myCompany.city,
    zip: 261001,
    country: `${myCompany.state}`,
    custom1: `Phone ${myCompany.phoneNumber1}`,
  };
  if(myCompany.phoneNumber2){
    data.sender.custom2 = `Phone ${myCompany.phoneNumber2}`
  }
  
  data.client = {
    company: `${customerData.name}`,
    address: `${customerData.address}`,
    zip: customerData.pinCode,
    city: customerData.city,
    country: `${myCompany.state}`,
  };
  data.invoiceNumber = fetchedData.sale.id.toString()+ '_' + date.toLocaleString().split(',')[0].toString()
  data.invoiceDate = fetchedData.sale.salePlacedDate.toLocaleString().split(',')[0]
  
  data.products = products;
  data.settings = {
    "currency": "INR",
    "tax-notation": "gst"
  };

  var name = fetchedData.sale.id.toString()+ '_' + date.toLocaleString().toString() + '.pdf';
  generateInvoice(data, name);
});

const populateSaleData = (customerArray) => {
  const dropdown = document.querySelector("#customer-dropdown");
  customerArray.forEach((customer) => {
    var optn = document.createElement("option");
    optn.setAttribute("value", customer.id);
    optn.innerText = customer.name;
    dropdown.appendChild(optn);
  });
  dropdown.value = fetchedData.sale.customerId;
  document.querySelector("#page-heading").innerText =
    dropdown.options[dropdown.selectedIndex].innerHTML;
  if (fetchedData.sale.settled === 0) {
    document.querySelector("#settle-sale").innerText = "Mark as settled";
    document.querySelector("#settle-inst").innerText =
      "Marking a sale settled will subtract all the item quantities from your stock";
    document.querySelector("#settle-sale").classList.add("blue-text");
  } else {
    document.querySelector("#settle-sale").innerText = "Mark as not settled";
    document.querySelector("#settle-inst").innerText =
      "Marking a sale un-settled will add all the item quantities to your stock";
    document.querySelector("#settle-sale").classList.add("red-text");
  }
  document.querySelector("#placed-date-input").value = convert(
    fetchedData.sale.salePlacedDate
  );
  document.querySelector("#total-sale-value").value = fetchedData.sale.total;
};

const populateItems = () => {
  const saleItemJunc = fetchedData.saleItemArray;

  saleItemJunc.forEach((saleItem) => {
    addItemField(
      saleItem.itemId,
      saleItem.quantity,
      saleItem.price / saleItem.quantity,
      saleItem.price
    );
  });
};

ipcRenderer.on("sale-specific-data", (event, data) => {
  fetchedData = data;

  if (fetchedData.sale.settled === 1) {
    document.querySelector("#update-the-sale").disabled = true;
    document.querySelectorAll("input").readOnly = true;
    document.querySelector("#show-invoice-form").classList.remove("grey-text");
    document.querySelector("#show-invoice-form").setAttribute("href", "#");
    document.querySelector("#show-invoice-form").classList.add("amber-text");
  }
  ipcRenderer.send("fetch-customer-data-for-sale", fetchedData.sale.customerId);
  ipcRenderer.on(
    "customer-data-fetched-for-sale",
    (event, data) => (customerData = data)
  );
  ipcRenderer.send("fetch-sold-item-data", fetchedData.sale.id);
  ipcRenderer.on("sold-items-fetched", (event, data) => {
    products = data;
  });
  items = data.itemArray;
  sellingPrice = data.sellingPriceArray;
  const { customerArray } = data;
  populateSaleData(customerArray);
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
  drp.setAttribute("value", "");
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
  if (fetchedItem) {
    drp.value = fetchedItem;
  }
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
  if (fetchedQty) quantityInput.value = fetchedQty;
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
  if (fetchedPricePerUnit) pricePerUnitInput.value = fetchedPricePerUnit;
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
  if (fetchedPrice) totalPrice.value = fetchedPrice;
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

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("sale-specific-window-loaded", saleId);
});

document.querySelector("#update-the-sale").addEventListener("click", (e) => {
  e.preventDefault();
  const customer = document.querySelector("#customer-dropdown").value;
  if (!customer)
    ipcRenderer.send("error-occured", {
      heading: "Customer not found",
      message: "Please select a customer",
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
  const total = document.querySelector("#total-sale-value").value;
  const salePlacedDate = document.querySelector("#placed-date-input").value;
  const customerId = document.querySelector("#customer-dropdown").value;
  const sale = {
    total,
    salePlacedDate,
    customerId,
  };
  const itemList = document.querySelectorAll(".item-list");
  const allItems = [];
  itemList.forEach((item) => {
    const itemId = item.children[0].value;
    const quantity = item.children[1].children[0].value;
    const price = item.children[3].children[0].value;
    allItems.push({ itemId, quantity, price, saleId });
  });
  ipcRenderer.send("update-sale", { allItems, sale, saleId });
};

document.querySelector("#settle-sale").addEventListener("click", () => {
  var newValue = 1;
  if (fetchedData.sale.settled === 1) newValue = 0;
  ipcRenderer.send("mark-sale-as-settled", { saleId, newValue });
});

ipcRenderer.on("sale-updated", (event) => {
  location.reload();
});
