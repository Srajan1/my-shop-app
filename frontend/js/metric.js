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

ipcRenderer.on("added-metric", (event) => {
  alert("New metric has been added");
});

ipcRenderer.on("metric-list-fetched", (event, metrics) => {
  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";
  metrics.forEach((metric) => {
    var row = document.createElement("tr");
    row.innerHTML = `<tr><td>${metric.name}</td>
      <td>${metric.description}</td></tr>`;
    tableBody.appendChild(row);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("metric-window-loaded");
  document
    .querySelector("#add-metric-button")
    .addEventListener("click", addMetric);
});
