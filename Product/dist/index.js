"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelExportProduct = exports.categoryList = exports.categoryCreate = exports.taxUpdate = exports.taxDelete = exports.taxList = exports.taxCreate = exports.productList = exports.productCreate = void 0;
const tslib_1 = require("tslib");
/*
 * Spurtcommerce Product
 * version 1.1.8
 * Copyrights © 2023, Spurtcommerce Esolutions Private Limited
 * Author Spurtcommerce Esolutions Pvt Ltd <support@spurtcommerce.com>
 * Licensed under the MIT license.
 */
const exporter_1 = tslib_1.__importDefault(require("./lib/exporter"));
const { productCreate, productList, taxCreate, taxList, taxDelete, taxUpdate, categoryCreate, categoryList, excelExportProduct, } = exporter_1.default;
exports.productCreate = productCreate;
exports.productList = productList;
exports.taxCreate = taxCreate;
exports.taxList = taxList;
exports.taxDelete = taxDelete;
exports.taxUpdate = taxUpdate;
exports.categoryCreate = categoryCreate;
exports.categoryList = categoryList;
exports.excelExportProduct = excelExportProduct;
//# sourceMappingURL=index.js.map