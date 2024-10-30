"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const customer_controller_1 = require("./customer/customer-controller");
const customer = {
    customerRegister: customer_controller_1.customerRegister,
    getCustomerList: customer_controller_1.getCustomerList,
    getCustomerProfile: customer_controller_1.getCustomerProfile,
};
exports.default = customer;
//# sourceMappingURL=exporter.js.map