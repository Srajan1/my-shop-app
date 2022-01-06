const easyinvoice = require("easyinvoice");
const path = require("path");
const fs = require("fs");

const generateInvoice = async (data, name) => {
  const result = await easyinvoice.createInvoice(data);
  easyinvoice.download("myInvoice.pdf", result.pdf);
};

module.exports = generateInvoice;
