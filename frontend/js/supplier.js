const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

const addSuppierDB = function(){
    if(document.querySelector('form').style.display == 'none')
    document.querySelector('form').style.display = 'block';
    else 
    document.querySelector('form').style.display = 'none';
}

const saveSupplier = async function(e){
    const supplierName = document.querySelector('#supplier-name').value;
    const supplierPhone = document.querySelector('#supplier-phone-number').value;
    const supplierAddress = document.querySelector('#supplier-address').value;
    const supplierDescription = document.querySelector('#supplier-description').value;
    const supplier = {};
    if(supplierName !== '')
    supplier.name = supplierName;
    if(supplierPhone !== '')
    supplier.phone = supplierPhone;
    if(supplierAddress !== '')
    supplier.address = supplierAddress;
    if(supplierDescription !== '')
    supplier.description = supplierDescription;
    console.log('button clicked');
    ipcRenderer.send('add-supplier', supplier);
}

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('supplier-window-loaded');
    const addSupplier = document.querySelector('#add-supplier');
    addSupplier.addEventListener('click', addSuppierDB);
    const saveSupplierDetails = document.querySelector('#save-supplier-details');
    saveSupplierDetails.addEventListener('click', (e) => {
        e.preventDefault();
        saveSupplier();
    });
})

ipcRenderer.on('supplier-added', (evt, result) => {
    console.log(result.dataValues);
})