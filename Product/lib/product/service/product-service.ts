import { Brackets, Connection, Like } from "typeorm";
import { addSlashes } from "./product-service-utils";

export const list = (_connection: Connection, limit: number, offset: number, select: any = [], relation: any = [], whereConditions: any = [], search: any = [], price: number, count: number | boolean): Promise<any> => {

    const productService = _connection.getRepository('Product');

    const condition: any = {};

    if (select && select.length > 0) {
        condition.select = select;
    }

    if (relation && relation.length > 0) {
        condition.relations = relation;
    }

    condition.where = {};

    if (whereConditions && whereConditions.length > 0) {
        whereConditions.forEach((item: any) => {
            const operator: string = item.op;
            if (operator === 'where' && item.value !== '') {
                condition.where[item.name] = item.value;
            } else if (operator === 'like' && item.value !== '') {
                condition.where[item.name] = Like('%' + item.value + '%');
            }
        });
    }

    if (search && search.length > 0) {
        search.forEach((item: any) => {
            const operator: string = item.op;
            if (operator === 'like' && item.value !== '') {
                condition.where[item.name] = Like('%' + item.value + '%');
            }
        });
    }
    if (price && price === 1) {
        condition.order = {
            price: 'ASC',
            createdDate: 'DESC',
        };
    } else if (price && price === 2) {
        condition.order = {
            price: 'DESC',
            createdDate: 'DESC',
        };
    } else {
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
}

export const listByQueryBuilder = async (
    _connection: Connection,
    limit: number,
    offset: number,
    select: any = [],
    whereConditions: any = [],
    searchConditions: any = [],
    relations: any = [],
    groupBy: any = [],
    sort: any = [],
    count: boolean = false,
    rawQuery: boolean = false
): Promise<any> => {

    const query: any = _connection.getRepository('Product').createQueryBuilder();

    // Select
    if (select && select.length > 0) {
        query.select(select);
    }
    // Join
    if (relations && relations.length > 0) {
        relations.forEach((joinTb: any) => {
            if (joinTb.op === 'left') {
                query.leftJoin(joinTb.tableName, joinTb.aliasName);
            } else if (joinTb.op === 'leftCond') {
                query.leftJoin(joinTb.tableName, joinTb.aliasName, joinTb.cond);
            } else {
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
        whereConditions.forEach((item: any) => {
            if (item.op === 'where' && item.sign === undefined) {
                query.where(item.name + ' = ' + item.value);
            } else if (item.op === 'and' && item.sign === undefined) {
                query.andWhere(item.name + ' = ' + item.value);
            } else if (item.op === 'and' && item.sign !== undefined) {
                query.andWhere(' \'' + item.name + '\'' + ' ' + item.sign + ' \'' + item.value + '\'');
            } else if (item.op === 'raw' && item.sign !== undefined) {
                query.andWhere(item.name + ' ' + item.sign + ' \'' + item.value + '\'');
            } else if (item.op === 'rawnumber' && item.sign !== undefined) {
                query.andWhere(item.name + ' ' + item.sign + ' ' + item.value + '');
            } else if (item.op === 'rawnumberor' && item.sign !== undefined) {
                query.orWhere(item.name + ' ' + item.sign + ' ' + item.value + '');
            } else if (item.op === 'or' && item.sign === undefined) {
                query.orWhere(item.name + ' = ' + item.value);
            } else if (item.op === 'IN' && item.sign === undefined) {
                query.andWhere(item.name + ' IN (' + item.value + ')');
            } else if (item.op === 'like' && item.sign === undefined) {
                query.andWhere(item.name + ' like ' + ' \'' + item.value + '\'');
            } else if (item.op === 'IS NULL' && item.sign === undefined) {
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
        searchConditions.forEach((table: any) => {
            if ((table.op === undefined && table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0)) {
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
            } else if (table.op === undefined && table.name && table.name instanceof Array && table.name.length > 0) {
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
            } else if (table.op === undefined && table.value && table.value instanceof Array && table.value.length > 0) {
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
            } else if ((table.op === 'attribute' && table.op !== undefined && table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0) && true) {
                const namesArray = table.name;
                namesArray.forEach((name: string, index: number) => {
                    query.andWhere(new Brackets(qb => {
                        const valuesArray = table.value;
                        valuesArray.forEach((value: any, subIndex: number) => {
                            if (subIndex === 0) {
                                qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + addSlashes(value.name.toLowerCase().trim() + '-' + value.value.toLowerCase().trim()) + '%\'');
                                return;
                            }
                            qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + addSlashes(value.name.toLowerCase().trim() + '-' + value.value.toLowerCase().trim()) + '%\'');
                        });
                    }));
                });
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