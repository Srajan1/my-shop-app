const XLSX = require("xlsx");
const { dialog, ipcRenderer } = require('electron')
require('./filesaver')
const convertJsonToExcel = (data) => {
  const workSheet = XLSX.utils.json_to_sheet(data);
  const workbook = {
    Sheets: {
      'data': workSheet
    },
    SheetNames: ['data']
  };
  const excelBuffer = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
  saveAsExcel(excelBuffer, 'Data');
};
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

function saveAsExcel(buffer, fileName){
  const data = new Blob([buffer], {type: EXCEL_TYPE});
  saveAs(data, fileName+'_export_'+new Date().getTime()+EXCEL_EXTENSION);
}

module.exports = convertJsonToExcel;
