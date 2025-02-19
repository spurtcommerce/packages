"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorProductListByQueryBuilder = exports.getOrderEarnings = exports.validateDisplayUrlName = exports.vendorSlug = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const vendorSlug = (_connection, data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const query = _connection.createQueryBuilder('Vendor', 'vendor');
    query.select(['vendor.vendor_id as vendorId', 'vendor.vendor_slug_name as vendorSlugName', 'customer.first_name as firstName']);
    query.where('customer.first_name = :value', { value: data });
    query.innerJoin('vendor.customer', 'customer');
    return query.getRawMany();
});
exports.vendorSlug = vendorSlug;
const validateDisplayUrlName = (_connection, name, checkVendor, vendorId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const query = _connection.createQueryBuilder('Vendor', 'vendor');
    query.where('vendor.displayNameUrl = :value', { value: name });
    query.andWhere('customer.deleteFlag = :deleteFlag', { deleteFlag: 0 });
    if (checkVendor === 1) {
        query.andWhere('vendor.vendorId != :value ', { value: vendorId });
    }
    query.innerJoin('vendor.customer', 'customer');
    return query.getRawOne();
});
exports.validateDisplayUrlName = validateDisplayUrlName;
const getOrderEarnings = (_connection, id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const query = yield _connection.createQueryBuilder('OrderProduct', 'orderProduct');
    query.select(['SUM(orderProduct.total + orderProduct.discountAmount) as productPriceTotal', 'COUNT(orderProduct.orderId) as orderCount', 'SUM(orderProduct.quantity) as quantityCount', 'COUNT(DISTINCT(product.customer_id)) as buyerCount']);
    query.innerJoin('orderProduct.product', 'product');
    query.where('orderProduct.productId = :productId', { productId: id });
    query.andWhere('product.paymentStatus = :value1', { value1: 1 });
    return query.getRawOne();
});
exports.getOrderEarnings = getOrderEarnings;
const vendorProductListByQueryBuilder = (_connection_1, limit_1, offset_1, ...args_1) => tslib_1.__awaiter(void 0, [_connection_1, limit_1, offset_1, ...args_1], void 0, function* (_connection, limit, offset, select = [], whereConditions = [], searchConditions = [], relations = [], groupBy = [], sort = [], price, count, rawQuery) {
    const query = yield _connection.getRepository('VendorProducts').createQueryBuilder();
    // Select
    if (select && select.length > 0) {
        query.select(select);
    }
    // Join
    if (relations && relations.length > 0) {
        relations.forEach((joinTb) => {
            if (joinTb.op === 'inner') {
                query.innerJoin(joinTb.tableName, joinTb.aliasName);
            }
            else if (joinTb.op === 'leftCond') {
                query.leftJoin(joinTb.tableName, joinTb.aliasName, joinTb.cond);
            }
            else {
                query.leftJoin(joinTb.tableName, joinTb.aliasName);
            }
        });
    }
    // Where
    if (whereConditions && whereConditions.length > 0) {
        whereConditions.forEach((item) => {
            if (item.op === 'where' && item.sign === undefined) {
                query.where(item.name + ' = ' + item.value);
            }
            else if (item.op === 'and' && item.sign === undefined) {
                query.andWhere(item.name + ' = ' + item.value);
            }
            else if (item.op === 'and' && item.sign !== undefined) {
                query.andWhere(' \'' + item.name + '\'' + ' ' + item.sign + ' \'' + item.value + '\'');
            }
            else if (item.op === 'raw' && item.sign !== undefined) {
                query.andWhere(item.name + ' ' + item.sign + ' \'' + item.value + '\'');
            }
            else if (item.op === 'or' && item.sign === undefined) {
                query.orWhere(item.name + ' = ' + item.value);
            }
            else if (item.op === 'IN' && item.sign === undefined) {
                query.andWhere(item.name + ' IN (' + item.value + ')');
            }
            else if (item.op === 'IS NULL' && item.sign === undefined) {
                query.andWhere(item.name + ' IS NULL' + item.value);
            }
        });
    }
    // Keyword Search
    if (searchConditions && searchConditions.length > 0) {
        searchConditions.forEach((table) => {
            if ((table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0)) {
                const namesArray = table.name;
                namesArray.forEach((name, index) => {
                    query.andWhere(new typeorm_1.Brackets(qb => {
                        const valuesArray = table.value;
                        valuesArray.forEach((value, subIndex) => {
                            if (subIndex === 0) {
                                qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                return;
                            }
                            qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                        });
                    }));
                });
            }
            else if (table.name && table.name instanceof Array && table.name.length > 0) {
                query.andWhere(new typeorm_1.Brackets(qb => {
                    const namesArray = table.name;
                    namesArray.forEach((name, index) => {
                        if (index === 0) {
                            qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                            return;
                        }
                        qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                    });
                }));
            }
            else if (table.value && table.value instanceof Array && table.value.length > 0) {
                query.andWhere(new typeorm_1.Brackets(qb => {
                    const valuesArray = table.value;
                    valuesArray.forEach((value, index) => {
                        if (index === 0) {
                            qb.andWhere('LOWER(' + table.name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                            return;
                        }
                        qb.orWhere('LOWER(' + table.name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                    });
                }));
            }
        });
    }
    // GroupBy
    if (groupBy && groupBy.length > 0) {
        let i = 0;
        groupBy.forEach((item) => {
            if (i === 0) {
                query.groupBy(item.name);
            }
            else {
                query.addGroupBy(item.name);
            }
            i++;
        });
    }
    // orderBy
    if (sort && sort.length > 0) {
        sort.forEach((item) => {
            query.orderBy('' + item.name + '', '' + item.order + '');
        });
    }
    // Limit & Offset
    if (limit && limit > 0) {
        query.limit(limit);
        query.offset(offset);
    }
    if (!count) {
        if (rawQuery) {
            return query.getRawMany();
        }
        return query.getMany();
    }
    else {
        return query.getCount();
    }
});
exports.vendorProductListByQueryBuilder = vendorProductListByQueryBuilder;
//# sourceMappingURL=vendor-service.js.map