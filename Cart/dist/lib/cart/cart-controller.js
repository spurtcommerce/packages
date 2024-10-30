"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartList = exports.cartDelete = exports.cartCreate = void 0;
const tslib_1 = require("tslib");
const cart_service_1 = require("./service/cart-service");
const moment_1 = tslib_1.__importDefault(require("moment"));
const cartCreate = (_connection, payload) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const cartParam = payload;
    const productService = _connection.getRepository('Product');
    const skuService = _connection.getRepository('Sku');
    const customerCartService = _connection.getRepository('CustomerCart');
    const product = yield productService.findOne({
        where: {
            productId: cartParam.productId,
        },
    });
    if (!product) {
        return {
            status: 0,
            message: 'Invalid ProductId',
        };
    }
    const sku = yield skuService.findOne({ where: { skuName: cartParam.skuName } });
    if (!sku) {
        return {
            status: 0,
            message: 'Invalid sku',
        };
    }
    const findOption = yield customerCartService.findOne({
        where: {
            skuName: cartParam.skuName, productId: cartParam.productId, customerId: cartParam.customerId,
        },
    });
    if (findOption) {
        if (cartParam.type && cartParam.type === 'new') {
            if (cartParam.quantity === 0) {
                yield customerCartService.delete(findOption.id);
                return {
                    status: 1,
                    message: 'Successfully removed from Cart',
                };
            }
            const qty = Number(findOption.quantity) + +cartParam.quantity;
            if (product.hasStock === 1) {
                if (!(sku.minQuantityAllowedCart <= qty)) {
                    return {
                        status: 0,
                        message: 'Quantity should greater than min Quantity.',
                    };
                }
                else if (!(sku.maxQuantityAllowedCart >= qty)) {
                    return {
                        status: 0,
                        message: 'Reached maximum quantity limit',
                    };
                }
            }
            findOption.quantity = qty;
        }
        else {
            findOption.quantity = cartParam.quantity;
        }
        findOption.productPrice = cartParam.productPrice;
        findOption.total = +cartParam.quantity * +cartParam.productPrice;
        findOption.tirePrice = cartParam.tirePrice ? cartParam.tirePrice : 0;
        findOption.vendorId = payload.vendorId;
        findOption.skuName = cartParam.skuName;
        findOption.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        findOption.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        yield customerCartService.save(findOption);
        return {
            status: 1,
            message: 'Successfully updated cart.',
            data: findOption,
        };
    }
    else {
        if (cartParam.quantity === 0) {
            if (!findOption) {
                return {
                    status: 1,
                    message: 'Successfully removed from Cart',
                };
            }
            yield customerCartService.delete(findOption.id);
            return {
                status: 1,
                message: 'Successfully removed from Cart',
            };
        }
        if (product.hasStock === 1) {
            if (!(sku.minQuantityAllowedCart <= +cartParam.quantity)) {
                return {
                    status: 0,
                    message: 'Quantity should greater than min Quantity.',
                };
            }
            else if (!(sku.maxQuantityAllowedCart >= +cartParam.quantity)) {
                return {
                    status: 0,
                    message: 'Reached maximum quantity limit',
                };
            }
        }
        const addCustomerCart = {};
        addCustomerCart.productId = cartParam.productId,
            addCustomerCart.name = product.name,
            addCustomerCart.customerId = cartParam.customerId,
            addCustomerCart.quantity = cartParam.quantity,
            addCustomerCart.productPrice = cartParam.productPrice,
            addCustomerCart.tirePrice = cartParam.tirePrice ? cartParam.tirePrice : 0,
            addCustomerCart.vendorId = payload.vendorId;
        addCustomerCart.total = +cartParam.quantity * +cartParam.productPrice,
            addCustomerCart.skuName = cartParam.skuName;
        addCustomerCart.ip = cartParam.ipAddress;
        addCustomerCart.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        addCustomerCart.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        const val = yield customerCartService.save(addCustomerCart);
        return {
            status: 1,
            message: 'Added to cart',
            data: val,
        };
    }
});
exports.cartCreate = cartCreate;
const cartDelete = (_connection, payload) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const customerCartService = _connection.getRepository('CustomerCart');
    if (!payload.productIds) {
        const customerCart = yield customerCartService.find({
            where: {
                customerId: payload.customerId,
            },
        });
        for (const cart of customerCart) {
            yield customerCartService.delete(cart.id);
        }
        return {
            status: 1,
            message: 'Your cart is Empty..!',
        };
    }
    const err = [];
    for (const id of payload.productIds) {
        const val = yield customerCartService.findOne(id);
        if (!val) {
            err.push(1);
        }
    }
    if (err.length > 0) {
        return {
            status: 0,
            message: 'Invalid cart Item',
        };
    }
    for (const id of payload.productIds) {
        yield customerCartService.delete(id);
    }
    return {
        status: 1,
        message: 'Removed from the cart',
    };
});
exports.cartDelete = cartDelete;
const cartList = (_connection, customerId, limit, offset, count) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const productImageService = _connection.getRepository('ProductImage');
    const productTirePriceService = _connection.getRepository('ProductTirePrice');
    const selects = ['CustomerCart.id as id',
        'CustomerCart.productPrice as productPrice',
        'CustomerCart.tirePrice as tirePrice',
        'CustomerCart.total as total',
        'CustomerCart.skuName as skuName',
        'product.productId as productId',
        'product.taxType as taxType',
        'product.taxValue as taxValue',
        'product.name as name',
        'product.price as price',
        'product.taxType as taxType',
        'CustomerCart.quantity as quantity',
        'product.description as description',
        'product.dateAvailable as dateAvailable',
        'product.sku as sku',
        'product.skuId as skuId',
        'product.sortOrder as sortOrder',
        'product.upc as upc',
        'product.rating as rating',
        'product.isActive as isActive',
        'product.productSlug as productSlug',
        'product.hasStock as hasStock',
        'product.outOfStockThreshold as outOfStockThreshold',
        'product.stockStatusId as stockStatusId',
        'product.createdDate as createdDate',
        'product.keywords as keywords',
        'IF(product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `product`.`tax_value` LIMIT 1), product.taxValue)  as taxValue',
        '(SELECT sku.id as skuId FROM sku WHERE sku.sku_name = skuName) as skuId',
        '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price',
        '(SELECT sku.out_of_stock_threshold as outOfStockThreshold FROM sku WHERE sku.id = skuId) as outOfStockThreshold',
        '(SELECT sku.notify_min_quantity_below as notifyMinQuantity FROM sku WHERE sku.id = skuId) as notifyMinQuantity',
        '(SELECT sku.min_quantity_allowed_cart as minQuantityAllowedCart FROM sku WHERE sku.id = skuId) as minQuantityAllowedCart',
        '(SELECT sku.max_quantity_allowed_cart as maxQuantityAllowedCart FROM sku WHERE sku.id = skuId) as maxQuantityAllowedCart',
        '(SELECT sku.enable_back_orders as enableBackOrders FROM sku WHERE sku.id = skuId) as enableBackOrders',
        '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
            ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
        '(SELECT price FROM product_special ps WHERE ps.product_id = product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial',
    ];
    const whereCondition = [];
    const relations = [];
    const groupBy = [];
    const sort = [];
    relations.push({
        tableName: 'CustomerCart.product',
        aliasName: 'product',
    });
    whereCondition.push({
        name: 'CustomerCart.customerId',
        op: 'where',
        value: customerId,
    });
    sort.push({
        name: 'CustomerCart.createdDate',
        order: 'DESC',
    });
    if (count) {
        const cartCount = yield (0, cart_service_1.cartListByQueryBuilder)(_connection, limit, offset, selects, whereCondition, [], relations, groupBy, sort, true, true);
        return {
            status: 1,
            message: 'Successfully got the cart count.',
            data: cartCount,
        };
    }
    const cartList = yield (0, cart_service_1.cartListByQueryBuilder)(_connection, limit, offset, selects, whereCondition, [], relations, groupBy, sort, false, true);
    let grandTotal = 0;
    const findImage = cartList.map((value) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const temp = value;
        temp.taxValue = +value.taxValue;
        temp.optionName = value.optionName;
        temp.quantity = value.quantity;
        temp.tirePrice = value.tirePrice;
        temp.productImage = yield productImageService.find({
            select: ['productId', 'image', 'containerName', 'defaultImage'],
            where: {
                productId: temp.productId,
            },
        });
        temp.productOriginalImage = temp.productImage.slice();
        grandTotal = 0;
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
        temp.productTirePrices = yield productTirePriceService.find({
            select: ['id', 'quantity', 'price'],
            where: { productId: value.productId, skuId: value.skuId },
        });
        if (value.hasStock === 1) {
            if (value.quantity <= value.outOfStockThreshold) {
                temp.stockStatus = 'outOfStock';
            }
            else {
                temp.stockStatus = 'inStock';
            }
        }
        else {
            temp.stockStatus = 'inStock';
        }
        return temp;
    }));
    const finalResult = yield Promise.all(findImage);
    if (cartList) {
        return {
            status: 1,
            message: 'Successfully got the cart list.',
            data: { cartList: finalResult, grandTotal },
        };
    }
    else {
        return {
            status: 0,
            message: 'unable to list cart list',
        };
    }
});
exports.cartList = cartList;
//# sourceMappingURL=cart-controller.js.map