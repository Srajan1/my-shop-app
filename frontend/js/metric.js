const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

const addMetric = () => {
  const addMetricName = document.querySelector("#add-metric-name");
  const addMetricDesc = document.querySelector("#add-metric-desc");
  const metric = {};
  if (addMetricName.value) {
    metric.name = addMetricName.value;
  }
  if (addMetricDesc.value) {
    metric.description = addMetricDesc.value;
  }
  ipcRenderer.send("add-metric", metric);
};

ipcRenderer.on('metric-deleted', (event) => {
  ipcRenderer.send("metric-window-loaded");
})

const manageFunction = () => {
  const manageButton = document.querySelectorAll('.manage-button')
  var i;
  for (i = 0; i < manageButton.length; i++) {
    manageButton[i].onclick = function () {
      document.querySelectorAll('.manage-button').forEach(pop => pop.style.display = 'block');
      document.querySelectorAll('.confirmation_pop').forEach(pop => pop.style.display = 'none');
      document.getElementsByClassName(`${this.id}_confirm`)[0].style.display = 'block';
      this.style.display = 'none';
      sessionStorage.setItem('metricId', this.id);
    };
  }

  const cancelButton = document.querySelectorAll('.cancel-button')
  var i;
  for (i = 0; i < cancelButton.length; i++) {
    cancelButton[i].onclick = function () {
      document.querySelectorAll('.manage-button').forEach(pop => pop.style.display = 'block');
      document.querySelectorAll('.confirmation_pop').forEach(pop => pop.style.display = 'none');
    };
  }

  const confirmButton = document.querySelectorAll('.confirm-button')
  var i;
  for (i = 0; i < confirmButton.length; i++) {
    confirmButton[i].onclick = function () {
      ipcRenderer.send('delete-metric', {metricId: sessionStorage.getItem('metricId')});
    };
  }

};

ipcRenderer.on("added-metric", (event) => {
  document.querySelector("#add-metric-button").disabled = false;
  ipcRenderer.send("show-message", {
    heading: "Metric added",
    message: "New metric has been added",
  });
  document.querySelector("#add-metric-name").value = '';
  document.querySelector("#add-metric-desc").value = '';
  ipcRenderer.send("metric-window-loaded");
});

ipcRenderer.on("metric-list-fetched", (event, metrics) => {
  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
  metrics.forEach((metric) => {
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${metric.name}</td>
      <td>${metric.description}</td>
      <td>
        <a href="#" class="manage-button red-text" id="${metric.id}"><abbr title="View">Delete this metric❌</abbr></a>
        <div style="display:none" class="${metric.id}_confirm confirmation_pop">
          <a href="#" class="red-text confirmation-popup confirm-button"><abbr title="View">confirm?</abbr></a>
          <a href="#" class="green-text confirmation-popup cancel-button"><abbr title="View">cancel?</abbr></a>
        </div>
      </td>
      </tr>`;
    tableBody.appendChild(row);
  });
  manageFunction();
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("metric-window-loaded");
  document
    .querySelector("#add-metric-button")
    .addEventListener("click", (e) => {
      e.preventDefault();
      e.target.disabled = true;
      addMetric();
    });
});
