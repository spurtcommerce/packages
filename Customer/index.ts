/*
 * Spurtcommerce Customer
 * version 1.0.3
 * Copyrights © 2023, Spurtcommerce Esolutions Private Limited
 * Author Spurtcommerce Esolutions Pvt Ltd <support@spurtcommerce.com>
 * Licensed under the MIT license.
 */
import customer from "./lib/exporter";

const {
    customerRegister,
    getCustomerList,
    getCustomerProfile,
} = customer;

export {
    customerRegister,
    getCustomerList,
    getCustomerProfile,
};
