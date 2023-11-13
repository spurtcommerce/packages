/*
 * Spurtcommerce Product
 * version 1.1.8
 * Copyrights © 2023, Spurtcommerce Esolutions Private Limited
 * Author Spurtcommerce Esolutions Pvt Ltd <support@spurtcommerce.com>
 * Licensed under the MIT license.
 */
import product from "./lib/exporter";

const {
    productCreate,
    productList,
    taxCreate,
    taxList,
    taxDelete,
    taxUpdate,
    categoryCreate,
    categoryList,
    excelExportProduct,
} = product;

export {
    productCreate,
    productList,
    taxCreate,
    taxList,
    taxDelete,
    taxUpdate,
    categoryCreate,
    categoryList,
    excelExportProduct,
};
