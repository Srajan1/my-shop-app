const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

document.querySelector('#login-button').addEventListener('click', () => {
    const enteredPassword = document.querySelector('#password').value;
    if(!enteredPassword)
    ipcRenderer.send("error-occured", {
        heading: "Password not found",
        message: "Please enter a password",
      });
    else{
        ipcRenderer.send('verify-password', (enteredPassword));
    }
})

document.querySelector('#form-toggle').addEventListener('click', () => {
    document.querySelector('#enter-password-form').style.display = 'none';
    document.querySelector('#change-password-form').style.display = 'block';
})

document.querySelector('#back-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#enter-password-form').style.display = 'block';
    document.querySelector('#change-password-form').style.display = 'none';
})

document.querySelector('#change-password').addEventListener('click', (e) => {
    e.preventDefault();
    const oldPassword = document.querySelector('#old-password').value;
    const newPassword = document.querySelector('#new-password').value;
    const confirmNewPassword = document.querySelector('#confirm-new-password').value;
    if(newPassword != confirmNewPassword)
    ipcRenderer.send("error-occured", {
        heading: "Invalid Entry",
        message: "Both new passwords do not match",
      });
    else{
        ipcRenderer.send('change-password', ({oldPassword, newPassword}));
    }
})

ipcRenderer.on('password-changed', () => {
    document.querySelector('#back-to-login').click();
    ipcRenderer.send('show-message', ({heading: 'Password changed', message: 'Now you can login with new password'}));
})

ipcRenderer.on('password-change-failed', () => {
    document.querySelector('#back-to-login').click();
    ipcRenderer.send("error-occured", {
        heading: "Invalid Password",
        message: "Please enter correct Password",
      });
})

ipcRenderer.on('successful-login', () => {
    const loginButton = document.querySelector('#login-button');
    loginButton.setAttribute('href', 'index.html');
    loginButton.click();
})

ipcRenderer.on('unsuccessful-login', () => {
    ipcRenderer.send("error-occured", {
        heading: "Invalid Password",
        message: "Please enter correct Password",
      });
})