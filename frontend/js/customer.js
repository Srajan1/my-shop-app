const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

const addSuppierFo = function () {};
let pageNumber = 1,
  totalPages,
  limit = 20,
  where = {};

  const manageFunction = () => {
    const manageButton = document.querySelectorAll('.manage-button')
    var i;
    for (i = 0; i < manageButton.length; i++) {
      manageButton[i].onclick = function () {
        sessionStorage.setItem("customerId", this.id);
      };
    }
  };

const saveCustomer = async function (e) {
  const customerName = document.querySelector("#customer-name").value;
  const customerPhone = document.querySelector("#customer-phone-number").value;
  const customerAddress = document.querySelector("#customer-address").value;
  const customerCity = document.querySelector("#customer-city").value;
  const customerPinCode = document.querySelector("#customer-pin-code").value;
  const customerState = document.querySelector("#customer-state").value;
  const customerDescription = document.querySelector(
    "#customer-description"
  ).value;
  const customer = {};
  if (customerName !== "") customer.name = customerName;
  if (customerPhone !== "") customer.phoneNumber = customerPhone;
  if (customerAddress !== "") customer.address = customerAddress;
  if (customerCity !== "") customer.city = customerCity;
  if (customerPinCode !== "") customer.pinCode = customerPinCode;
  if (customerState !== "") customer.state = customerState;
  if (customerDescription !== "") customer.description = customerDescription;
    console.log(customer);
  ipcRenderer.send("add-customer", customer);
};

const prevButton = document
  .querySelector("#prev-button")
  .addEventListener("click", () => {
    --pageNumber;
    ipcRenderer.send("customer-window-loaded", { pageNumber, where, limit });
  });

const nextButton = document
  .querySelector("#next-button")
  .addEventListener("click", () => {
    ++pageNumber;
    ipcRenderer.send("customer-window-loaded", { pageNumber, where, limit });
  });

document
  .querySelector("#filter-customer-details")
  .addEventListener("click", (e) => {
    e.preventDefault();
    where = {};
    const filterName = document.querySelector("#filter-name").value;
    const filterPhone = document.querySelector("#filter-phone").value;
    const filterAddress = document.querySelector("#filter-address").value;
    const filterCity = document.querySelector("#filter-city").value;
    const filterPinCode = document.querySelector("#filter-pin-code").value;
    const filterState = document.querySelector("#filter-state").value;
    if (filterName) where.name = filterName;
    if (filterPhone) where.phone = filterPhone;
    if (filterAddress) where.address = filterAddress;
    if (filterCity) where.city = filterCity;
    if (filterPinCode) where.pinCode = filterPinCode;
    if (filterState) where.state = filterState;
    document.querySelector("#filter-name").value = "";
    document.querySelector("#filter-phone").value = "";
    document.querySelector("#filter-address").value = "";
    document.querySelector("#filter-city").value = "";
    document.querySelector("#filter-state").value = "";
    document.querySelector("#filter-pin-code").value = "";
    ipcRenderer.send("customer-window-loaded", { pageNumber, where, limit });
  });

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("customer-window-loaded", { pageNumber, where, limit });
  const addCustomerFormToggle = document.querySelector(
    "#add-customer-form-toggle"
  );
  addCustomerFormToggle.addEventListener("click", () => {
    if (document.querySelector("#adding-form").style.display == "none")
      document.querySelector("#adding-form").style.display = "block";
    else document.querySelector("#adding-form").style.display = "none";
  });
  const saveCustomerDetails = document.querySelector("#save-customer-details");
  saveCustomerDetails.addEventListener("click", (e) => {
    e.preventDefault();
    saveCustomer();
  });

  const filterFormToggle = document.querySelector("#filter-form-toggle");
  filterFormToggle.addEventListener("click", () => {
    if (document.querySelector("#filter-form").style.display == "none")
      document.querySelector("#filter-form").style.display = "block";
    else document.querySelector("#filter-form").style.display = "none";
  });
});

ipcRenderer.on("customer-added", (evt, result) => {
  ipcRenderer.send("show-message", { heading: 'Customer added', message: 'New customer has been added' });
  ipcRenderer.send("customer-window-loaded", { pageNumber, where, limit });
});

ipcRenderer.on("fetched-customers", (event, customersInfo) => {
  const customers = customersInfo.customerArray,
    count = customersInfo.count;
  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
  totalPages = Math.ceil(count / limit);
  if (pageNumber === 1)
    document.querySelector("#prev-button").style.pointerEvents = "none";
  else document.querySelector("#prev-button").style.pointerEvents = "auto";
  if (pageNumber === totalPages)
    document.querySelector("#next-button").style.pointerEvents = "none";
  else document.querySelector("#next-button").style.pointerEvents = "auto";
  customers.forEach((customer) => {
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${customer.name}</td>
    <td>${customer.phoneNumber}</td>
    <td>${customer.address}</td>
    <td><a href="customerSpecific.html" class="transparent btn manage-button"  id="${customer.id}">📝</a></td></tr>`;
    tableBody.appendChild(row);
  });
  manageFunction();
  totalPages = Math.floor(count / limit);
  if (count % limit != 0) ++totalPages;
  const currentPage = document.querySelector("#current-page");
  currentPage.innerText = `page ${pageNumber}`;
});
