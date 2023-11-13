import { Brackets, Connection } from 'typeorm';

export const vendorSlug = async (_connection: Connection, data: string): Promise<any> => {
    const query: any = _connection.createQueryBuilder('Vendor', 'vendor');
    query.select(['vendor.vendor_id as vendorId', 'vendor.vendor_slug_name as vendorSlugName', 'customer.first_name as firstName']);
    query.where('customer.first_name = :value', { value: data });
    query.innerJoin('vendor.customer', 'customer');
    return query.getRawMany();
}

export const validateDisplayUrlName = async (_connection: Connection, name: string, checkVendor: number, vendorId: number): Promise<any> => {
    const query: any = _connection.createQueryBuilder('Vendor', 'vendor');
    query.where('vendor.displayNameUrl = :value', { value: name });
    query.andWhere('customer.deleteFlag = :deleteFlag', { deleteFlag: 0 });
    if (checkVendor === 1) {
        query.andWhere('vendor.vendorId != :value ', { value: vendorId });
    }
    query.innerJoin('vendor.customer', 'customer');
    return query.getRawOne();
}

export const getOrderEarnings = async (_connection: Connection, id: number): Promise<any> => {
    const query: any = await _connection.createQueryBuilder('OrderProduct', 'orderProduct');
    query.select(['SUM(orderProduct.total + orderProduct.discountAmount) as productPriceTotal', 'COUNT(orderProduct.orderId) as orderCount', 'SUM(orderProduct.quantity) as quantityCount', 'COUNT(DISTINCT(product.customer_id)) as buyerCount']);
    query.innerJoin('orderProduct.product', 'product');
    query.where('orderProduct.productId = :productId', { productId: id });
    query.andWhere('product.paymentStatus = :value1', { value1: 1 });
    return query.getRawOne();
}

export const vendorProductListByQueryBuilder = async (
    _connection: Connection,
    limit: number,
    offset: number,
    select: any = [],
    whereConditions: any = [],
    searchConditions: any = [],
    relations: any = [],
    groupBy: any = [],
    sort: any = [],
    price: number,
    count: number | boolean,
    rawQuery: boolean,
): Promise<any> => {
    const query: any = await _connection.getRepository('VendorProducts').createQueryBuilder();
    // Select
    if (select && select.length > 0) {
        query.select(select);
    }
    // Join
    if (relations && relations.length > 0) {
        relations.forEach((joinTb: any) => {
            if (joinTb.op === 'inner') {
                query.innerJoin(joinTb.tableName, joinTb.aliasName);
            } else if (joinTb.op === 'leftCond') {
                query.leftJoin(joinTb.tableName, joinTb.aliasName, joinTb.cond);
            } else {
                query.leftJoin(joinTb.tableName, joinTb.aliasName);
            }
        });
    }
    // Where
    if (whereConditions && whereConditions.length > 0) {
        whereConditions.forEach((item: any) => {
            if (item.op === 'where' && item.sign === undefined) {
                query.where(item.name + ' = ' + item.value);
            } else if (item.op === 'and' && item.sign === undefined) {
                query.andWhere(item.name + ' = ' + item.value);
            } else if (item.op === 'and' && item.sign !== undefined) {
                query.andWhere(' \'' + item.name + '\'' + ' ' + item.sign + ' \'' + item.value + '\'');
            } else if (item.op === 'raw' && item.sign !== undefined) {
                query.andWhere(item.name + ' ' + item.sign + ' \'' + item.value + '\'');
            } else if (item.op === 'or' && item.sign === undefined) {
                query.orWhere(item.name + ' = ' + item.value);
            } else if (item.op === 'IN' && item.sign === undefined) {
                query.andWhere(item.name + ' IN (' + item.value + ')');
            } else if (item.op === 'IS NULL' && item.sign === undefined) {
                query.andWhere(item.name + ' IS NULL' + item.value);
            }
        });
    }
    // Keyword Search
    if (searchConditions && searchConditions.length > 0) {
        searchConditions.forEach((table: any) => {
            if ((table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0)) {
                const namesArray = table.name;
                namesArray.forEach((name: string, index: number) => {
                    query.andWhere(new Brackets(qb => {
                        const valuesArray = table.value;
                        valuesArray.forEach((value: string | number, subIndex: number) => {
                            if (subIndex === 0) {
                                qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                return;
                            }
                            qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                        });
                    }));
                });
            } else if (table.name && table.name instanceof Array && table.name.length > 0) {
                query.andWhere(new Brackets(qb => {
                    const namesArray = table.name;
                    namesArray.forEach((name: string, index: number) => {
                        if (index === 0) {
                            qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                            return;
                        }
                        qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                    });
                }));
            } else if (table.value && table.value instanceof Array && table.value.length > 0) {
                query.andWhere(new Brackets(qb => {
                    const valuesArray = table.value;
                    valuesArray.forEach((value: string | number, index: number) => {
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
        groupBy.forEach((item: any) => {
            if (i === 0) {
                query.groupBy(item.name);
            } else {
                query.addGroupBy(item.name);
            }
            i++;
        });
    }
    // orderBy
    if (sort && sort.length > 0) {
        sort.forEach((item: any) => {
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
    } else {
        return query.getCount();
    }
}