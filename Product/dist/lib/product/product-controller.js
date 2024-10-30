"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productList = exports.productCreate = void 0;
const tslib_1 = require("tslib");
const moment_1 = tslib_1.__importDefault(require("moment"));
const class_transformer_1 = require("class-transformer");
const product_service_1 = require("./service/product-service");
const product_service_utils_1 = require("./service/product-service-utils");
const productCreate = (payload, _connection) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const skuService = _connection.getRepository('Sku');
    const categoryService = _connection.getRepository('Category');
    const productService = _connection.getRepository('Product');
    const productToCategoryService = _connection.getRepository('ProductToCategory');
    const productImageService = _connection.getRepository('ProductImage');
    const productDiscountService = _connection.getRepository('ProductDiscount');
    const productSpecialService = _connection.getRepository('ProductSpecial');
    const productTirePriceService = _connection.getRepository('ProductTirePrice');
    const productVideoService = _connection.getRepository('ProductVideo');
    const product = payload;
    const category = product.categoryId;
    if (!(category === null || category === void 0 ? void 0 : category.length)) {
        return {
            status: 0,
            message: 'Category should not be empty',
        };
    }
    if ((product.tax < 0)) {
        const errorResponse = {
            status: 0,
            message: 'tax should not be in negative',
        };
        return (errorResponse);
    }
    const newProduct = {};
    if (+newProduct.price === 0) {
        return ({
            status: 0,
            message: 'It is mandatory to mention price for the product.',
        });
    }
    const productImage = product.image;
    if (productImage.length === 0) {
        return ({
            status: 0,
            message: 'You need to upload at least one image for the product.',
        });
    }
    newProduct.name = product.productName;
    newProduct.description = product.productDescription ? (0, product_service_utils_1.escapeChar)(product.productDescription) : '';
    const metaTagTitle = product.productSlug ? product.productSlug : product.productName;
    const slug = metaTagTitle.trim();
    const data = slug.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
    newProduct.productSlug = yield (0, product_service_utils_1.validate_slug)(_connection, data);
    newProduct.sku = product.sku;
    newProduct.upc = product.upc;
    newProduct.hsn = product.hsn;
    newProduct.quantity = product.quantity ? product.quantity : 1;
    newProduct.quotationAvailable = product.quotationAvailable ? product.quotationAvailable : 0;
    ///// different charges//////
    const serviceCharge = {};
    serviceCharge.productCost = product.price;
    serviceCharge.packingCost = product.packingCost ? product.packingCost : 0;
    serviceCharge.shippingCost = product.shippingCost ? product.shippingCost : 0;
    serviceCharge.tax = 0;
    serviceCharge.others = product.others ? product.others : 0;
    newProduct.serviceCharges = JSON.stringify(serviceCharge);
    newProduct.price = serviceCharge.productCost + serviceCharge.packingCost + serviceCharge.shippingCost + serviceCharge.others;
    newProduct.taxType = product.taxType ? product.taxType : 0;
    newProduct.taxValue = product.tax ? product.tax : 0;
    newProduct.stockStatusId = product.outOfStockStatus ? product.outOfStockStatus : 0;
    // saving sku //
    const findSku = yield skuService.findOne({ where: { skuName: product.sku } });
    if (findSku) {
        const errorResponse = {
            status: 0,
            message: 'Duplicate sku name, give some other name.',
        };
        return (errorResponse);
    }
    const newSku = {};
    newSku.skuName = product.sku;
    newSku.price = newProduct.price;
    newSku.quantity = product.quantity ? product.quantity : 1;
    newSku.isActive = product.status;
    newSku.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    newSku.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    const saveSku = yield skuService.save(newSku);
    // ending sku //
    newProduct.skuId = saveSku.id;
    newProduct.shipping = product.requiredShipping;
    newProduct.dateAvailable = (0, moment_1.default)(product.dateAvailable).toISOString();
    newProduct.isActive = product.status;
    newProduct.isFeatured = 0;
    newProduct.todayDeals = 0;
    newProduct.sortOrder = product.sortOrder ? product.sortOrder : 1;
    newProduct.height = (product && product.height) ? product.height : 0;
    newProduct.weight = (product && product.weight) ? product.weight : 0;
    newProduct.length = (product && product.length) ? product.length : 0;
    newProduct.width = (product && product.width) ? product.width : 0;
    newProduct.hasTirePrice = product.hasTirePrice ? product.hasTirePrice : 0;
    const row = [];
    if (category.length !== 0) {
        for (const categoryId of category) {
            const categoryNames = yield categoryService.findOne({
                where: {
                    categoryId,
                },
            });
            const name = '~' + categoryNames.name + '~';
            row.push(name);
        }
        row.push('~' + product.productName + '~');
    }
    const value = row.toString();
    newProduct.keywords = value;
    newProduct.owner = 1;
    newProduct.createdBy = 0;
    newProduct.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    newProduct.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    const saveProduct = yield productService.save(newProduct);
    // save category
    if (category.length !== 0) {
        for (const categoryId of category) {
            const newProductToCategory = {};
            newProductToCategory.productId = saveProduct.productId;
            newProductToCategory.categoryId = categoryId;
            newProductToCategory.isActive = 1;
            newProductToCategory.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            newProductToCategory.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            yield productToCategoryService.save(newProductToCategory);
        }
    }
    // Save products Image
    for (const imageRow of productImage) {
        const imageData = JSON.stringify(imageRow);
        const imageResult = JSON.parse(imageData);
        const newProductImage = {};
        newProductImage.productId = saveProduct.productId;
        newProductImage.image = imageResult.image;
        newProductImage.containerName = imageResult.containerName;
        newProductImage.defaultImage = imageResult.defaultImage;
        newProductImage.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        newProductImage.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        yield productImageService.save(newProductImage);
    }
    // Product Discount
    if (product.productDiscount) {
        const productDiscount = product.productDiscount;
        for (const discount of productDiscount) {
            const discountData = {};
            discountData.productId = saveProduct.productId;
            discountData.quantity = 1;
            discountData.priority = discount.discountPriority;
            discountData.price = discount.discountPrice;
            discountData.dateStart = (0, moment_1.default)(discount.discountDateStart).toISOString();
            discountData.dateEnd = (0, moment_1.default)(discount.discountDateEnd).toISOString();
            discountData.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            discountData.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            yield productDiscountService.save(discountData);
        }
    }
    // Product Special
    if (product.productSpecial) {
        const productSpecial = product.productSpecial;
        for (const special of productSpecial) {
            const specialPriceData = {};
            specialPriceData.productId = saveProduct.productId;
            specialPriceData.priority = special.specialPriority;
            specialPriceData.price = special.specialPrice;
            specialPriceData.dateStart = (0, moment_1.default)(special.specialDateStart).toISOString();
            specialPriceData.dateEnd = (0, moment_1.default)(special.specialDateEnd).toISOString();
            specialPriceData.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            specialPriceData.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            yield productSpecialService.save(specialPriceData);
        }
    }
    // Product tire price
    if (product.tirePrices) {
        const tirePrice = product.tirePrices;
        for (const tire of tirePrice) {
            const productTirePrice = {};
            productTirePrice.productId = saveProduct.productId;
            productTirePrice.quantity = tire.quantity;
            productTirePrice.price = tire.price;
            productTirePrice.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            productTirePrice.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            yield productTirePriceService.save(productTirePrice);
        }
    }
    // save product Video
    if (product.productVideo) {
        const video = product.productVideo;
        const productVideo = {};
        productVideo.productId = saveProduct.productId;
        productVideo.name = video.name;
        productVideo.path = video.path;
        productVideo.type = video.type;
        productVideo.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        productVideo.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        yield productVideoService.save(productVideo);
    }
    saveProduct.isSimplified = 1;
    yield productService.save(saveProduct);
    return ({
        status: 1,
        message: 'Successfully saved Product.',
        data: saveProduct,
    });
});
exports.productCreate = productCreate;
var productCol;
(function (productCol) {
    productCol["productId"] = "Product.productId as productId";
    productCol["productName"] = "Product.name as name";
    productCol["description"] = "Product.description as description";
    productCol["productPrice"] = "Product.price as price";
    productCol["productSlug"] = "Product.productSlug as productSlug";
    productCol["quantity"] = "Product.quantity as quantity";
    productCol["keywords"] = "Product.keywords as keywords";
    productCol["isActive"] = "Product.isActive as isActive";
    productCol["dateAvailable"] = "Product.dateAvailable as dateAvailable";
    productCol["width"] = "Product.width as width";
    productCol["height"] = "Product.height as height";
    productCol["length"] = "Product.length as length";
    productCol["weight"] = "Product.weight as weight";
    productCol["image"] = "(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as image";
    productCol["containerName"] = "(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as containerName";
    productCol["defaultImage"] = "(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage";
    productCol["sku"] = "(SELECT sku.sku_name as sku FROM sku WHERE sku.id = skuId) as sku";
    productCol["price"] = "(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price";
    productCol["modifiedPrice"] = "(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as modifiedPrice";
    productCol["productDiscount"] = "(SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE()))  ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount";
    productCol["productSpecial"] = "(SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE())) ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial";
})(productCol || (productCol = {}));
const productList = (_connection, select, limit, offset, keyword, productName, sku, status, price, count) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const columns = ['Product.skuId as skuId', ...select.map((col) => productCol[col])];
    const relations = [];
    const groupBy = [];
    const WhereConditions = [];
    if (sku) {
        WhereConditions.push({
            name: 'Product.sku',
            op: 'like',
            value: sku,
        });
    }
    if (status) {
        WhereConditions.push({
            name: 'Product.isActive',
            op: 'and',
            value: status,
        });
    }
    const searchConditions = [];
    const searchConditionName = ['Product.name'];
    if (keyword !== '') {
        searchConditions.push({
            name: searchConditionName,
            value: keyword,
        });
    }
    else if (productName === null || productName === void 0 ? void 0 : productName.trim()) {
        searchConditions.push({
            name: searchConditionName,
            value: productName,
        });
    }
    const sort = [];
    if (+price && price === 1) {
        sort.push({
            name: 'Product.price',
            order: 'ASC',
        });
    }
    else if (+price && price === 2) {
        sort.push({
            name: 'Product.price',
            order: 'DESC',
        });
    }
    else {
        sort.push({
            name: 'Product.createdDate',
            order: 'DESC',
        });
    }
    const productLists = yield (0, product_service_1.listByQueryBuilder)(_connection, limit, offset, columns, WhereConditions, searchConditions, relations, groupBy, sort, false, true);
    if (count) {
        const productListCount = yield (0, product_service_1.listByQueryBuilder)(_connection, limit, offset, columns, WhereConditions, searchConditions, relations, groupBy, sort, true, true);
        return {
            status: 1,
            message: 'Successfully got product lists count.',
            data: productListCount,
        };
    }
    const productList = productLists.map((value) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const temp = value;
        const date = (0, moment_1.default)(value.dateAvailable).format('YYYY-MM-DD');
        const currentDate = (0, moment_1.default)().format('YYYY-MM-DD');
        if (currentDate >= date && value.isActive === 1) {
            temp.globe = 1;
        }
        else {
            temp.globe = 0;
        }
        if (value.productSpecial !== null) {
            temp.pricerefer = value.productSpecial;
            temp.flag = 1;
        }
        else if (value.productDiscount !== null) {
            temp.pricerefer = value.productDiscount;
            temp.flag = 0;
        }
        else {
            temp.pricerefer = '';
            temp.flag = '';
        }
        return temp;
    }));
    const results = yield Promise.all(productList);
    return {
        status: 1,
        message: 'Successfully got the complete product list.',
        data: (0, class_transformer_1.instanceToPlain)(results),
    };
});
exports.productList = productList;
//# sourceMappingURL=product-controller.js.map