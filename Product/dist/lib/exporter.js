"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_controller_1 = require("./product/product-controller");
const tax_controller_1 = require("./tax/tax-controller");
const category_controller_1 = require("./category/category-controller");
const product_export_controller_1 = require("./product/product-export-controller");
const product = {
    productCreate: product_controller_1.productCreate,
    productList: product_controller_1.productList,
    taxCreate: tax_controller_1.taxCreate,
    taxDelete: tax_controller_1.taxDelete,
    taxList: tax_controller_1.taxList,
    taxUpdate: tax_controller_1.taxUpdate,
    categoryList: category_controller_1.categoryList,
    categoryCreate: category_controller_1.categoryCreate,
    excelExportProduct: product_export_controller_1.excelExportProduct,
};
exports.default = product;
//# sourceMappingURL=exporter.js.map