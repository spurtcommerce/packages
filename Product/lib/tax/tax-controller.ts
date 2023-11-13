import { Connection } from "typeorm";
import { list } from "./service/tax-service";

export const taxCreate = async (
    _connection: Connection,
    payload: {
        taxName: string,
        taxPercentage: number,
        taxStatus: number,
    }
) => {
    const taxService = _connection.getRepository('Tax');

    const existTax = await taxService.findOne({ where: { taxName: payload.taxName } });
    if (existTax) {
        return {
            status: 0,
            message: 'Tax name already exits.',
        };
    }
    const newTax = {} as any;
    newTax.taxName = payload.taxName;
    newTax.taxPercentage = payload.taxPercentage;
    newTax.taxStatus = payload.taxStatus;

    const taxSave = await taxService.save(newTax);

    return {
        status: 1,
        message: 'Successfully created new tax.',
        data: taxSave,
    };
}

export const taxList = async (
    _connection: Connection,
    limit: number,
    offset: number,
    keyword: string,
    status: string,
    count: number | boolean
) => {

    const WhereConditions = [];

    if (status === '0' || status) {
        WhereConditions.push({
            name: 'taxStatus',
            value: status,
        });
    }

    const taxList = await list(_connection, limit, offset, [], WhereConditions, keyword, count);

    return {
        status: 1,
        message: 'Successfully get all tax List',
        data: taxList,
    };
}

export const taxDelete = async (
    _connection: Connection,
    taxId: number,
) => {

    const taxService = await _connection.getRepository('Tax');
    const productService = await _connection.getRepository('Product');

    const tax: any = await taxService.findOne({
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

    const product = await productService.findOne({
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

    await taxService.delete(tax);

    return {
        status: 1,
        message: 'Successfully deleted the Tax.',
    }

}

export const taxUpdate = async (
    _connection: Connection,
    payload: {
        taxId: number,
        taxName: string,
        taxPercentage: number,
        taxStatus: number,
    }
) => {
    const taxService = _connection.getRepository('Tax');

    const taxExist: any = await taxService.findOne({ where: { taxId: payload.taxId } });

    if (!taxExist) {
        return {
            status: 0,
            message: `Invalid Tax Id..!`
        };
    }

    const existTaxName = await taxService.findOne({ where: { taxName: payload.taxName } });

    if (existTaxName) {
        return {
            status: 0,
            message: 'Tax name already exits.',
        };
    }

    taxExist.taxName = payload.taxName;
    taxExist.taxPercentage = payload.taxPercentage;
    taxExist.taxStatus = payload.taxStatus;

    const taxSave = await taxService.save(taxExist);

    return {
        status: 1,
        message: 'Successfully Updated Tax.',
        data: taxSave,
    };
}
