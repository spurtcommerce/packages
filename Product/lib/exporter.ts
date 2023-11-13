import { productCreate, productList } from "./product/product-controller";
import { taxCreate, taxDelete, taxList, taxUpdate } from './tax/tax-controller';
import { categoryCreate, categoryList } from "./category/category-controller";
import { excelExportProduct } from "./product/product-export-controller";

const product = {
    productCreate,
    productList,
    taxCreate,
    taxDelete,
    taxList,
    taxUpdate,
    categoryList,
    categoryCreate,
    excelExportProduct,
};

export default product;
