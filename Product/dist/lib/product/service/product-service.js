"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listByQueryBuilder = exports.list = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const product_service_utils_1 = require("./product-service-utils");
const list = (_connection, limit, offset, select = [], relation = [], whereConditions = [], search = [], price, count) => {
    const productService = _connection.getRepository('Product');
    const condition = {};
    if (select && select.length > 0) {
        condition.select = select;
    }
    if (relation && relation.length > 0) {
        condition.relations = relation;
    }
    condition.where = {};
    if (whereConditions && whereConditions.length > 0) {
        whereConditions.forEach((item) => {
            const operator = item.op;
            if (operator === 'where' && item.value !== '') {
                condition.where[item.name] = item.value;
            }
            else if (operator === 'like' && item.value !== '') {
                condition.where[item.name] = (0, typeorm_1.Like)('%' + item.value + '%');
            }
        });
    }
    if (search && search.length > 0) {
        search.forEach((item) => {
            const operator = item.op;
            if (operator === 'like' && item.value !== '') {
                condition.where[item.name] = (0, typeorm_1.Like)('%' + item.value + '%');
            }
        });
    }
    if (price && price === 1) {
        condition.order = {
            price: 'ASC',
            createdDate: 'DESC',
        };
    }
    else if (price && price === 2) {
        condition.order = {
            price: 'DESC',
            createdDate: 'DESC',
        };
    }
    else {
        condition.order = {
            createdDate: 'DESC',
        };
    }
    if (limit && limit > 0) {
        condition.take = limit;
        condition.skip = offset;
    }
    if (count) {
        return productService.count(condition);
    }
    return productService.find(condition);
};
exports.list = list;
const listByQueryBuilder = (_connection, limit, offset, select = [], whereConditions = [], searchConditions = [], relations = [], groupBy = [], sort = [], count = false, rawQuery = false) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const query = _connection.getRepository('Product').createQueryBuilder();
    // Select
    if (select && select.length > 0) {
        query.select(select);
    }
    // Join
    if (relations && relations.length > 0) {
        relations.forEach((joinTb) => {
            if (joinTb.op === 'left') {
                query.leftJoin(joinTb.tableName, joinTb.aliasName);
            }
            else if (joinTb.op === 'leftCond') {
                query.leftJoin(joinTb.tableName, joinTb.aliasName, joinTb.cond);
            }
            else {
                query.innerJoin(joinTb.tableName, joinTb.aliasName);
            }
        });
    }
    // Where
    if (whereConditions && whereConditions.length > 0) {
        // const variant = whereConditions.find((condition: { sign: string; }) => condition.sign === 'variant' && pluginModule.includes('ProductVariants'));
        //let variantSql;
        if (true) {
            // await hooks.addHook('variant-filter', 'variantFilter-namespace', async () => {
            //     const VariantFilter = await require('../../../../add-ons/ProductVariants/VariantFilterProcess');
            //     return await VariantFilter.variantProcess(variant.value);
            // });
            // variantSql = await hooks.runHook('variant-filter');
        }
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
            else if (item.op === 'rawnumber' && item.sign !== undefined) {
                query.andWhere(item.name + ' ' + item.sign + ' ' + item.value + '');
            }
            else if (item.op === 'rawnumberor' && item.sign !== undefined) {
                query.orWhere(item.name + ' ' + item.sign + ' ' + item.value + '');
            }
            else if (item.op === 'or' && item.sign === undefined) {
                query.orWhere(item.name + ' = ' + item.value);
            }
            else if (item.op === 'IN' && item.sign === undefined) {
                query.andWhere(item.name + ' IN (' + item.value + ')');
            }
            else if (item.op === 'like' && item.sign === undefined) {
                query.andWhere(item.name + ' like ' + ' \'' + item.value + '\'');
            }
            else if (item.op === 'IS NULL' && item.sign === undefined) {
                query.orWhere(item.name + ' IS NULL ' + item.value);
            }
            // else if (variant) {
            //     query.andWhere(item.name + ' IN (' + variantSql + ') ');
            // }
        });
    }
    // Keyword Search
    if (searchConditions && searchConditions.length > 0) {
        console.log('searchConditions:', searchConditions);
        searchConditions.forEach((table) => {
            if ((table.op === undefined && table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0)) {
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
            else if (table.op === undefined && table.name && table.name instanceof Array && table.name.length > 0) {
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
            else if (table.op === undefined && table.value && table.value instanceof Array && table.value.length > 0) {
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
            else if ((table.op === 'attribute' && table.op !== undefined && table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0) && true) {
                const namesArray = table.name;
                namesArray.forEach((name, index) => {
                    query.andWhere(new typeorm_1.Brackets(qb => {
                        const valuesArray = table.value;
                        valuesArray.forEach((value, subIndex) => {
                            if (subIndex === 0) {
                                qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + (0, product_service_utils_1.addSlashes)(value.name.toLowerCase().trim() + '-' + value.value.toLowerCase().trim()) + '%\'');
                                return;
                            }
                            qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + (0, product_service_utils_1.addSlashes)(value.name.toLowerCase().trim() + '-' + value.value.toLowerCase().trim()) + '%\'');
                        });
                    }));
                });
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
exports.listByQueryBuilder = listByQueryBuilder;
//# sourceMappingURL=product-service.js.map