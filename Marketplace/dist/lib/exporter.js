"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vendor_controller_1 = require("./vendor/vendor-controller");
const vendor_product_controller_1 = require("./vendor/vendor-product-controller");
const marketplace = {
    vendorRegister: vendor_controller_1.vendorRegister,
    getVendorProfile: vendor_controller_1.getVendorProfile,
    vendorProductList: vendor_product_controller_1.vendorProductList
};
exports.default = marketplace;
//# sourceMappingURL=exporter.js.map