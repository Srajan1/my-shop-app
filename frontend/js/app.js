const { ipcRenderer } = require("electron");
const electron = require("electron");
var loaded = 0;
const ipc = electron.ipcRenderer;

document.querySelector('#edit-company-form-toggle').addEventListener('click', () => {
    if(document.querySelector('form').style.display === 'none'){
        document.querySelector('form').style.display = 'block';
        document.querySelector('#company-details').style.display = 'none';
    }
    else{ 
        document.querySelector('form').style.display = 'none';
        if(loaded)document.querySelector('#company-details').style.display = 'block';
    }
})

ipcRenderer.on('company-details-updated', (event) => {
    location.reload();
})

ipcRenderer.on('company-details-fetched', (event, data) => {
    loaded = 1;
    document.querySelector('#company-details').style.display = 'block';
    document.querySelector('#company-name').value = data.companyName;
    document.querySelector('#company-name-display').innerHTML = `<strong>Name:</strong> ${data.companyName}`;
    document.querySelector('#gstin-number').value = data.GSTIN;
    document.querySelector('#company-gst-display').innerHTML = `<strong>GST:</strong> ${data.GSTIN}`;
    document.querySelector('#address').value = data.address;
    document.querySelector('#company-address-display').innerHTML = `<strong>Address:</strong> ${data.address}`;
    document.querySelector('#city').value = data.city;
    document.querySelector('#company-city-display').innerHTML = `<strong>City:</strong> ${data.city}`;
    document.querySelector('#state').value = data.state;
    document.querySelector('#company-state-display').innerHTML = `<strong>State:</strong> ${data.state}`;
    document.querySelector('#phone-number1').value = data.phoneNumber1;
    document.querySelector('#company-phone1-display').innerHTML = `<strong>Phone number 1:</strong> ${data.phoneNumber1}`;
    document.querySelector('#phone-number2').value = data.phoneNumber2;
    document.querySelector('#company-phone2-display').innerHTML = `<strong>Phone number 2:</strong> ${data.phoneNumber2}`;
    sessionStorage.setItem("myCompany", JSON.stringify(data));
})

document.querySelector('#update-details').addEventListener('click', (e) => {
    e.preventDefault();
    const companyName = document.querySelector('#company-name').value;
    const GSTIN = document.querySelector('#gstin-number').value;
    const address = document.querySelector('#address').value;
    const city = document.querySelector('#city').value;
    const state = document.querySelector('#state').value;
    const phoneNumber1 = document.querySelector('#phone-number1').value;
    const phoneNumber2 = document.querySelector('#phone-number2').value;
    var error = 0;
    if(!companyName){
        ipcRenderer.send('show-message', ({heading: 'Invalid submission', message: 'Please enter company name'}));
        error = 1;
    }
    if(!GSTIN && error === 0){
        ipcRenderer.send('show-message', ({heading: 'Invalid submission', message: 'Please enter company GST number'}));
        error = 1;
    }
    if(!address && error === 0){
        ipcRenderer.send('show-message', ({heading: 'Invalid submission', message: 'Please enter company address'}));
        error = 1;
    }
    if(!city && error === 0){
        ipcRenderer.send('show-message', ({heading: 'Invalid submission', message: 'Please enter company city'}));
        error = 1;
    }
    if(!state && error === 0){
        ipcRenderer.send('show-message', ({heading: 'Invalid submission', message: 'Please enter company state'}));
        error = 1;
    }
    if(!phoneNumber1 && error === 0){
        ipcRenderer.send('show-message', ({heading: 'Invalid submission', message: 'Please enter company phone number'}));
        error = 1;
    }
    if(error === 0){
        ipcRenderer.send('save-company-details', {companyName, GSTIN, address, city, state, phoneNumber1, phoneNumber2});
    }
})

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send('company-window-loaded');
  });