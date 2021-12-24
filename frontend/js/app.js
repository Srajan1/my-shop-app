const electron = require("electron");
const ipc = electron.ipcRenderer;
const companyNameButton = document.querySelector('#save-company-name');
companyNameButton.addEventListener('click', () => {
    const name = document.querySelector('#company-name').value;
    if(name === '')
    {
        alert('please enter a company name');
    }
    
    document.querySelector('#company-name').value = '';
})