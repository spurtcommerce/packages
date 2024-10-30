"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerProfile = exports.getCustomerList = exports.customerRegister = void 0;
const tslib_1 = require("tslib");
/*
 * Spurtcommerce Customer
 * version 1.0.3
 * Copyrights © 2023, Spurtcommerce Esolutions Private Limited
 * Author Spurtcommerce Esolutions Pvt Ltd <support@spurtcommerce.com>
 * Licensed under the MIT license.
 */
const exporter_1 = tslib_1.__importDefault(require("./lib/exporter"));
const { customerRegister, getCustomerList, getCustomerProfile, } = exporter_1.default;
exports.customerRegister = customerRegister;
exports.getCustomerList = getCustomerList;
exports.getCustomerProfile = getCustomerProfile;
//# sourceMappingURL=index.js.map