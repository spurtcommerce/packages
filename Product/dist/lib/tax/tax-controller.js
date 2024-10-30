"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxUpdate = exports.taxDelete = exports.taxList = exports.taxCreate = void 0;
const tslib_1 = require("tslib");
const tax_service_1 = require("./service/tax-service");
const taxCreate = (_connection, payload) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const taxService = _connection.getRepository('Tax');
    const existTax = yield taxService.findOne({ where: { taxName: payload.taxName } });
    if (existTax) {
        return {
            status: 0,
            message: 'Tax name already exits.',
        };
    }
    const newTax = {};
    newTax.taxName = payload.taxName;
    newTax.taxPercentage = payload.taxPercentage;
    newTax.taxStatus = payload.taxStatus;
    const taxSave = yield taxService.save(newTax);
    return {
        status: 1,
        message: 'Successfully created new tax.',
        data: taxSave,
    };
});
exports.taxCreate = taxCreate;
const taxList = (_connection, limit, offset, keyword, status, count) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const WhereConditions = [];
    if (status === '0' || status) {
        WhereConditions.push({
            name: 'taxStatus',
            value: status,
        });
    }
    const taxList = yield (0, tax_service_1.list)(_connection, limit, offset, [], WhereConditions, keyword, count);
    return {
        status: 1,
        message: 'Successfully get all tax List',
        data: taxList,
    };
});
exports.taxList = taxList;
const taxDelete = (_connection, taxId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const taxService = yield _connection.getRepository('Tax');
    const productService = yield _connection.getRepository('Product');
    const tax = yield taxService.findOne({
        where: {
            taxId,
        },
    });
    if (!tax) {
        return {
            status: 0,
            message: 'Invalid tax Id.',
        };
    }
    const product = yield productService.findOne({
        where: {
            taxType: tax.type, taxValue: tax.Value,
        },
    });
    if (product) {
        return {
            status: 0,
            message: 'You cannot delete this tax as it is already mapped to a product.',
        };
    }
    yield taxService.delete(tax);
    return {
        status: 1,
        message: 'Successfully deleted the Tax.',
    };
});
exports.taxDelete = taxDelete;
const taxUpdate = (_connection, payload) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const taxService = _connection.getRepository('Tax');
    const taxExist = yield taxService.findOne({ where: { taxId: payload.taxId } });
    if (!taxExist) {
        return {
            status: 0,
            message: `Invalid Tax Id..!`
        };
    }
    const existTaxName = yield taxService.findOne({ where: { taxName: payload.taxName } });
    if (existTaxName) {
        return {
            status: 0,
            message: 'Tax name already exits.',
        };
    }
    taxExist.taxName = payload.taxName;
    taxExist.taxPercentage = payload.taxPercentage;
    taxExist.taxStatus = payload.taxStatus;
    const taxSave = yield taxService.save(taxExist);
    return {
        status: 1,
        message: 'Successfully Updated Tax.',
        data: taxSave,
    };
});
exports.taxUpdate = taxUpdate;
//# sourceMappingURL=tax-controller.js.map