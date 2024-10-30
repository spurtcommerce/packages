"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorProductList = void 0;
const tslib_1 = require("tslib");
const vendor_service_1 = require("./service/vendor-service");
const vendorProductList = (_connection, limit, offset, keyword, sku, status, approvalFlag, price, productName, vendorName, updatedOn, sortBy, sortOrder, count, vendorId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const productToCategoryService = yield _connection.getRepository('ProductToCategory');
    const categoryService = yield _connection.getRepository('Category');
    const selects = ['VendorProducts.vendorProductId as vendorProductId',
        'VendorProducts.vendorProductCommission as vendorProductCommission',
        'VendorProducts.quotationAvailable as quotationAvailable',
        'VendorProducts.approvalFlag as approvalFlag',
        'VendorProducts.rejectReason as rejectReason',
        'vendor.vendorId as vendorId',
        'product.productId as productId',
        'product.name as name',
        'product.sku as sku',
        'product.skuId as skuId',
        'product.price as productprice',
        'product.quantity as quantity',
        'customer.firstName as vendorName',
        'product.sortOrder as sortOrder',
        'product.isActive as isActive',
        'product.productSlug as productSlug',
        'product.width as width',
        'product.height as height',
        'product.length as length',
        'product.weight as weight',
        'VendorProducts.createdDate as createdDate',
        'VendorProducts.modifiedDate as modifiedDate',
        'product.keywords as keywords',
        'product.isSimplified as isSimplified',
        'product.attributeKeyword as attributeKeyword',
        '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = product.productId AND pi.default_image = 1 LIMIT 1) as image',
        '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
        '(SELECT sku.sku_name as sku FROM sku WHERE sku.id = skuId) as sku',
        '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price',
        '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as modifiedPrice',
        '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
            'ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
        '(SELECT price FROM product_special ps WHERE ps.product_id = product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial'];
    const whereCondition = [];
    const relations = [];
    const groupBy = [];
    relations.push({
        tableName: 'VendorProducts.product',
        aliasName: 'product',
    }, {
        tableName: 'VendorProducts.vendor',
        aliasName: 'vendor',
    }, {
        tableName: 'vendor.customer',
        aliasName: 'customer',
    });
    if (status && status !== '') {
        whereCondition.push({
            name: 'product.isActive',
            op: 'and',
            value: +status,
        });
    }
    if (approvalFlag && approvalFlag !== '') {
        whereCondition.push({
            name: 'VendorProducts.approvalFlag',
            op: 'and',
            value: +approvalFlag,
        });
    }
    whereCondition.push({
        name: 'vendor.vendorId',
        op: 'and',
        value: vendorId,
    }, {
        name: 'VendorProducts.reuse',
        op: 'IS NULL',
        value: '',
    });
    const searchConditions = [];
    if (keyword) {
        searchConditions.push({
            name: ['product.keywords', 'product.name', 'customer.first_name'],
            value: keyword.toLowerCase(),
        });
    }
    else if (!keyword) {
        if (productName === null || productName === void 0 ? void 0 : productName.trim()) {
            searchConditions.push({
                name: ['product.name'],
                value: productName.toLowerCase(),
            });
        }
        if (vendorName === null || vendorName === void 0 ? void 0 : vendorName.trim()) {
            searchConditions.push({
                name: ['customer.first_name'],
                value: vendorName.toLowerCase(),
            });
        }
        if (sku === null || sku === void 0 ? void 0 : sku.trim()) {
            searchConditions.push({
                name: ['product.sku'],
                value: sku.toLowerCase(),
            });
        }
        if (updatedOn === null || updatedOn === void 0 ? void 0 : updatedOn.trim()) {
            searchConditions.push({
                name: ['VendorProducts.modifiedDate'],
                value: updatedOn,
            });
        }
        if (price) {
            whereCondition.push({
                name: 'product.price',
                op: 'and',
                value: price,
            });
        }
    }
    const sort = [];
    if (sortBy === 'productName') {
        sort.push({
            name: 'product.name',
            order: sortOrder !== null && sortOrder !== void 0 ? sortOrder : 'DESC',
        });
    }
    if (sortBy === 'stock') {
        sort.push({
            name: 'product.quantity',
            order: sortOrder !== null && sortOrder !== void 0 ? sortOrder : 'DESC',
        });
    }
    if (sortBy === 'sku') {
        sort.push({
            name: 'product.sku',
            order: sortOrder !== null && sortOrder !== void 0 ? sortOrder : 'DESC',
        });
    }
    if (sortBy === 'createdDate' || !sortBy || sortBy === 'orderId') {
        sort.push({
            name: 'VendorProducts.createdDate',
            order: 'DESC',
        });
    }
    if (count) {
        const vendorProductListCount = yield (0, vendor_service_1.vendorProductListByQueryBuilder)(_connection, limit, offset, selects, whereCondition, searchConditions, relations, groupBy, sort, price, true, true);
        return {
            status: 1,
            message: 'Successfully got Vendor Product count.',
            data: vendorProductListCount,
        };
    }
    const vendorProductList = yield (0, vendor_service_1.vendorProductListByQueryBuilder)(_connection, limit, offset, selects, whereCondition, searchConditions, relations, groupBy, sort, price, false, true);
    const productList = vendorProductList.map((value) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const temp = value;
        const categories = yield productToCategoryService.find({
            select: ['categoryId', 'productId'],
            where: { productId: value.productId },
        }).then((val) => {
            const category = val.map((values) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const categoryNames = yield categoryService.findOne({ categoryId: values.categoryId });
                const tempp = values;
                if (categoryNames !== undefined) {
                    tempp.categoryName = categoryNames.name;
                }
                else {
                    tempp.categoryName = '';
                }
                return tempp;
            }));
            const result = Promise.all(category);
            return result;
        });
        temp.vendorCategory = categories;
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
        const orderProduct = yield (0, vendor_service_1.getOrderEarnings)(_connection, value.productId);
        if (orderProduct) {
            temp.earnings = orderProduct.productPriceTotal;
        }
        else {
            temp.earnings = '';
        }
        return temp;
    }));
    const results = yield Promise.all(productList);
    return {
        status: 1,
        message: 'Successfully got your product list.',
        data: results,
    };
});
exports.vendorProductList = vendorProductList;
//# sourceMappingURL=vendor-product-controller.js.map