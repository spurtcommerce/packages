"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorProductList = exports.getVendorProfile = exports.vendorRegister = void 0;
const tslib_1 = require("tslib");
/*
 * Spurtcommerce Marketplace
 * version 1.0.9
 * Copyrights © 2023, Spurtcommerce Esolutions Private Limited
 * Author Spurtcommerce Esolutions Pvt Ltd <support@spurtcommerce.com>
 * Licensed under the MIT license.
 */
const exporter_1 = tslib_1.__importDefault(require("./lib/exporter"));
const { vendorRegister, getVendorProfile, vendorProductList, } = exporter_1.default;
exports.vendorRegister = vendorRegister;
exports.getVendorProfile = getVendorProfile;
exports.vendorProductList = vendorProductList;
//# sourceMappingURL=index.js.map