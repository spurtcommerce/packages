"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDiscountPricewithSku = exports.findSpecialPriceWithSku = exports.findTirePrice = void 0;
const tslib_1 = require("tslib");
const findTirePrice = (_connection, productId, skuId, quantity) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const query = yield _connection.manager.createQueryBuilder('ProductTirePrice', 'productTirePrice');
    query.select(['productTirePrice.price as price', 'productTirePrice.quantity as quantity', 'productTirePrice.productId as productId']);
    query.where('productTirePrice.productId = ' + productId);
    query.where('productTirePrice.skuId = ' + skuId);
    query.andWhere('productTirePrice.quantity <= ' + quantity);
    query.orderBy('productTirePrice.quantity', 'DESC');
    query.limit('1');
    return query.getRawOne();
});
exports.findTirePrice = findTirePrice;
const findSpecialPriceWithSku = (_connection, productId, skuId, todaydate) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const query = yield _connection.manager.createQueryBuilder('ProductSpecial', 'productSpecial');
    query.select(['productSpecial.price as price', 'productSpecial.dateStart as dateStart', 'productSpecial.dateEnd as dateEnd', 'productSpecial.skuId as skuId']);
    query.where('productSpecial.productId = ' + productId);
    query.andWhere('productSpecial.skuId = ' + skuId);
    query.andWhere('(productSpecial.dateStart <= :todaydate AND productSpecial.dateEnd >= :todaydate)', { todaydate });
    query.orderBy('productSpecial.priority', 'ASC');
    query.addOrderBy('productSpecial.price', 'ASC');
    query.limit('1');
    return query.getRawOne();
});
exports.findSpecialPriceWithSku = findSpecialPriceWithSku;
const findDiscountPricewithSku = (_connection, productId, skuId, todaydate) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const query = yield _connection.manager.createQueryBuilder('ProductDiscount', 'productDiscount');
    query.select(['productDiscount.price as price', 'productDiscount.dateStart as dateStart', 'productDiscount.dateEnd as dateEnd']);
    query.where('productDiscount.productId = ' + productId);
    query.where('productDiscount.skuId = ' + skuId);
    query.andWhere('(productDiscount.dateStart <= :todaydate AND productDiscount.dateEnd >= :todaydate)', { todaydate });
    query.orderBy('productDiscount.priority', 'ASC');
    query.addOrderBy('productDiscount.price', 'ASC');
    query.limit('1');
    return query.getRawOne();
});
exports.findDiscountPricewithSku = findDiscountPricewithSku;
//# sourceMappingURL=order-service.js.map