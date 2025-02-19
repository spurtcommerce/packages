"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const list = (_connection_1, ...args_1) => tslib_1.__awaiter(void 0, [_connection_1, ...args_1], void 0, function* (_connection, limit = 0, offset = 0, select = [], whereConditions = [], keyword, count) {
    const condition = {};
    if (select && select.length > 0) {
        condition.select = select;
    }
    condition.where = {};
    if (whereConditions && whereConditions.length > 0) {
        whereConditions.forEach((item) => {
            condition.where[item.name] = item.value;
        });
    }
    if (keyword) {
        condition.where = {
            taxName: (0, typeorm_1.Like)('%' + keyword + '%'),
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
    }
    else {
        return _connection.getRepository('Tax').find(condition);
    }
});
exports.list = list;
//# sourceMappingURL=tax-service.js.map