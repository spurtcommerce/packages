import { Connection, Like } from "typeorm";

export const list = async (_connection: Connection, limit: number = 0, offset: number = 0, select: any = [], whereConditions: any = [], keyword: string, count: number | boolean): Promise<any> => {
    const condition: any = {};

    if (select && select.length > 0) {
        condition.select = select;
    }

    condition.where = {};

    if (whereConditions && whereConditions.length > 0) {
        whereConditions.forEach((item: any) => {
            condition.where[item.name] = item.value;
        });
    }
    if (keyword) {
        condition.where = {
            taxName: Like('%' + keyword + '%'),
        };
    }

    condition.order = {
        createdDate: 'DESC',
    };

    if (limit && limit > 0) {
        condition.take = limit;
        condition.skip = offset;
    }

    if (count) {
        return _connection.getRepository('Tax').count(condition);
    } else {
        return _connection.getRepository('Tax').find(condition);
    }

}