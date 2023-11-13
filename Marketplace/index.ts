/*
 * Spurtcommerce Marketplace
 * version 1.0.9
 * Copyrights © 2023, Spurtcommerce Esolutions Private Limited
 * Author Spurtcommerce Esolutions Pvt Ltd <support@spurtcommerce.com>
 * Licensed under the MIT license.
 */
import marketplace from "./lib/exporter";

const {
    vendorRegister,
    getVendorProfile,
    vendorProductList,
} = marketplace;

export {
    vendorRegister,
    getVendorProfile,
    vendorProductList
};
