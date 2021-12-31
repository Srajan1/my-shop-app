const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
var items = [], costPrice;

const makePaidZero = () => {
  document.querySelector('#money-paid').value = null;
  document.querySelector('#total-order-value').value = null;
}

const addItemField = () => {
  const tableBody = document.querySelector("#table-body");
  var drp = document.createElement('select');
  drp.required = true;
  drp.classList.add('browser-default');
  drp.classList.add('item-dropdown');
  const disabledDrp = document.createElement('option');
  disabledDrp.disabled = 'true';
  disabledDrp.setAttribute('selected', true);
  disabledDrp.innerHTML = 'Choose an item';
  drp.appendChild(disabledDrp)
  items.forEach((item) => {
    var optn = document.createElement("option");
    optn.setAttribute("value", item.id);
    optn.innerText = `${item.name}`;
    drp.appendChild(optn);
  })
  drp.onchange = (e) => {
    makePaidZero();
    const itemId = e.target.value;
    const pricePerUnitEle = e.target.nextElementSibling.nextElementSibling.children[0];
    e.target.nextElementSibling.nextElementSibling.nextElementSibling.children[0].value = null;
    e.target.nextElementSibling.children[0].value = null;
    var price;
    var isPresent = 0;
    costPrice.forEach(item => {
      if(item.itemId == itemId){
        price = item.price;
        isPresent = 1;
      }
    });
    if(isPresent){
      pricePerUnitEle.value = price;
    }else{
      pricePerUnitEle.value = null;
      pricePerUnitEle.setAttribute('placeholder', 'No price found, please add price')
    }
    
  }
  const removeButton = document.createElement('button');
  removeButton.classList.add('transparent');
  removeButton.classList.add('btn');
  removeButton.innerHTML = '❌';
  removeButton.onclick = function(e){
    makePaidZero();
    e.preventDefault();
    e.target.parentElement.parentElement.remove();
  }
  const quantityInput = document.createElement('input');
  quantityInput.required = true;
  quantityInput.classList.add('quantity-input')
  quantityInput.setAttribute('type', 'number');
  quantityInput.setAttribute('placeholder', 'Enter quantity');
  quantityInput.oninput = (e) => {
    makePaidZero();
    const totalPriceEle = e.target.parentElement.nextElementSibling.nextElementSibling.children[0];
    const pricePerUnit = e.target.parentElement.nextElementSibling.children[0].value;
    totalPriceEle.value = pricePerUnit * e.target.value
  }
  const pricePerUnitInput = document.createElement('input');
  pricePerUnitInput.required = true;
  pricePerUnitInput.classList.add('price-per-unit-input')
  pricePerUnitInput.setAttribute('type', 'number');
  pricePerUnitInput.setAttribute('placeholder', 'price per unit');
  pricePerUnitInput.oninput = (e) => {
    makePaidZero();
    const totalPriceEle = e.target.parentElement.nextElementSibling.children[0];
    const quantity = e.target.parentElement.previousElementSibling.children[0].value;
    totalPriceEle.value = e.target.value * quantity;
  }

  drp.style.marginTop = 15;
  const column = document.createElement('td');
  column.appendChild(drp);
  var row = document.createElement("tr");
  row.appendChild(drp);
  const td1 = document.createElement('td');
  td1.appendChild(quantityInput);
  row.appendChild(td1)
  const td2 = document.createElement('td');
  td2.appendChild(pricePerUnitInput);
  row.appendChild(td2)
  const td3 = document.createElement('td');
  td3.innerHTML = '<input type="number" class="price-value" placeholder="total price" readonly>'
  row.appendChild(td3)
  const td4 = document.createElement('td');
  td4.appendChild(removeButton);
  row.appendChild(td4)
  tableBody.appendChild(row);
  
};

document.querySelector('#add-another-item').addEventListener('click', (e) => {
  e.preventDefault();
  addItemField();
})

document.querySelector('#money-paid').oninput = () => {
  const totalPrices = document.querySelectorAll('.price-value');
  var total = 0;
  totalPrices.forEach((price) => {total += parseInt(price.value)})
  document.querySelector('#total-order-value').value = total-document.querySelector('#money-paid').value;
}


const populateSuppliers = (supplierArray) => {
  const dropdown = document.querySelector("#supplier-dropdown");
  dropdown.id="supplier-dropdown"
  dropdown.innerHTML = "";
  supplierArray.forEach((supplier) => {
    var optn = document.createElement("option");
    optn.setAttribute("value", supplier.id);
    optn.innerText = supplier.name;
    dropdown.appendChild(optn);
  });
};

document.querySelector('#place-the-order').addEventListener('click', (e) => {
  e.preventDefault();
  const supplier = document.querySelector("#supplier-dropdown").value;
  if(!supplier)
  alert('select supplier');
  const items = document.querySelectorAll('.item-dropdown');
  items.forEach((item) => {if(!item.value || item.value === 'Choose an item') alert('Make sure valid items are selected')})
  const quantities = document.querySelectorAll('.quantity-input');
  quantities.forEach((quantity) => {if(!quantity.value) alert('Make sure all quantites are mentioned')})
  const pricePerUnitInput = document.querySelectorAll('.price-per-unit-input');
  pricePerUnitInput.forEach((price) => {if(!price.value) alert('Make sure all price per units are mentioned')})
  if(!document.querySelector('#money-paid').value){
    alert('Enter already paid amount')
  }
})

ipcRenderer.on("supplier-item-fetched", (event, data) => {
  items = data.itemArray;
  costPrice = data.costPriceArray;
  const { supplierArray } = data;
  populateSuppliers(supplierArray);
  addItemField();
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("order-window-loaded");
});
