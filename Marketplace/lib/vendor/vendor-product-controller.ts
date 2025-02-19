import { Connection } from "typeorm";
import { getOrderEarnings, vendorProductListByQueryBuilder } from "./service/vendor-service";

export const vendorProductList = async (
    _connection: Connection,
    limit: number,
    offset: number,
    keyword: string,
    sku: string,
    status: string,
    approvalFlag: string,
    price: number,
    productName: string,
    vendorName: string,
    updatedOn: string,
    sortBy: string,
    sortOrder: string,
    count: number | boolean,
    vendorId: number
): Promise<{
    status: number,
    message: string,
    data?: any
}> => {

    const productToCategoryService = await _connection.getRepository('ProductToCategory');
    const categoryService = await _connection.getRepository('Category');

    const selects = ['VendorProducts.vendorProductId as vendorProductId',
        'VendorProducts.vendorProductCommission as vendorProductCommission',
        'VendorProducts.quotationAvailable as quotationAvailable',
        'VendorProducts.approvalFlag as approvalFlag',
        'VendorProducts.rejectReason as rejectReason',
        'vendor.vendorId as vendorId',
        'product.productId as productId',
        'product.name as name',
        'product.sku as sku',
        'product.skuId as skuId',
        'product.price as productprice',
        'product.quantity as quantity',
        'customer.firstName as vendorName',
        'product.sortOrder as sortOrder',
        'product.isActive as isActive',
        'product.productSlug as productSlug',
        'product.width as width',
        'product.height as height',
        'product.length as length',
        'product.weight as weight',
        'VendorProducts.createdDate as createdDate',
        'VendorProducts.modifiedDate as modifiedDate',
        'product.keywords as keywords',
        'product.isSimplified as isSimplified',
        'product.attributeKeyword as attributeKeyword',
        '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = product.productId AND pi.default_image = 1 LIMIT 1) as image',
        '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
        '(SELECT sku.sku_name as sku FROM sku WHERE sku.id = skuId) as sku',
        '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price',
        '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as modifiedPrice',
        '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
        'ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
        '(SELECT price FROM product_special ps WHERE ps.product_id = product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial'];
    const whereCondition = [];
    const relations = [];
    const groupBy = [];
    relations.push(
        {
            tableName: 'VendorProducts.product',
            aliasName: 'product',
        },
        {
            tableName: 'VendorProducts.vendor',
            aliasName: 'vendor',
        },
        {
            tableName: 'vendor.customer',
            aliasName: 'customer',
        }
    );
    if (status && status !== '') {
        whereCondition.push({
            name: 'product.isActive',
            op: 'and',
            value: +status,
        });
    }
    if (approvalFlag && approvalFlag !== '') {
        whereCondition.push({
            name: 'VendorProducts.approvalFlag',
            op: 'and',
            value: +approvalFlag,
        });
    }
    whereCondition.push(
        {
            name: 'vendor.vendorId',
            op: 'and',
            value: vendorId,
        },
        {
            name: 'VendorProducts.reuse',
            op: 'IS NULL',
            value: '',
        }
    );
    const searchConditions = [];
    if (keyword) {
        searchConditions.push({
            name: ['product.keywords', 'product.name', 'customer.first_name'],
            value: keyword.toLowerCase(),
        });
    } else if (!keyword) {
        if (productName?.trim()) {
            searchConditions.push({
                name: ['product.name'],
                value: productName.toLowerCase(),
            });
        }
        if (vendorName?.trim()) {
            searchConditions.push({
                name: ['customer.first_name'],
                value: vendorName.toLowerCase(),
            });
        }
        if (sku?.trim()) {
            searchConditions.push({
                name: ['product.sku'],
                value: sku.toLowerCase(),
            });
        }
        if (updatedOn?.trim()) {
            searchConditions.push({
                name: ['VendorProducts.modifiedDate'],
                value: updatedOn,
            });
        }
        if (price) {
            whereCondition.push({
                name: 'product.price',
                op: 'and',
                value: price,
            });
        }
    }
    const sort = [];

    if (sortBy === 'productName') {
        sort.push({
            name: 'product.name',
            order: sortOrder ?? 'DESC',
        });
    }
    if (sortBy === 'stock') {
        sort.push({
            name: 'product.quantity',
            order: sortOrder ?? 'DESC',
        });
    }
    if (sortBy === 'sku') {
        sort.push({
            name: 'product.sku',
            order: sortOrder ?? 'DESC',
        });
    }
    if (sortBy === 'modifiedDate') {
        sort.push({
            name: 'VendorProducts.modifiedDate',
            order: sortOrder ?? 'DESC',
        });
    }
    if (sortBy === 'createdDate' || !sortBy || sortBy === 'orderId') {
        sort.push({
            name: 'VendorProducts.createdDate',
            order: 'DESC',
        });
    }

    if (count) {
        const vendorProductListCount: any = await vendorProductListByQueryBuilder(_connection, limit, offset, selects, whereCondition, searchConditions, relations, groupBy, sort, price, true, true);
        return {
            status: 1,
            message: 'Successfully got Vendor Product count.',
            data: vendorProductListCount,
        };
    }
    const vendorProductList: any = await vendorProductListByQueryBuilder(_connection, limit, offset, selects, whereCondition, searchConditions, relations, groupBy, sort, price, false, true);
    const productList = vendorProductList.map(async (value: any) => {
        const temp: any = value;
        const categories = await productToCategoryService.find({
            select: ['categoryId', 'productId'],
            where: { productId: value.productId },
        }).then((val) => {
            const category = val.map(async (values: any) => {
                const categoryNames: any = await categoryService.findOne({ categoryId: values.categoryId });
                const tempp: any = values;
                if (categoryNames !== undefined) {
                    tempp.categoryName = categoryNames.name;
                } else {
                    tempp.categoryName = '';
                }
                return tempp;
            });
            const result = Promise.all(category);
            return result;
        });
        temp.vendorCategory = categories;
        if (value.productSpecial !== null) {
            temp.pricerefer = value.productSpecial;
            temp.flag = 1;
        } else if (value.productDiscount !== null) {
            temp.pricerefer = value.productDiscount;
            temp.flag = 0;
        } else {
            temp.pricerefer = '';
            temp.flag = '';
        }
        const orderProduct = await getOrderEarnings(_connection, value.productId);
        if (orderProduct) {
            temp.earnings = orderProduct.productPriceTotal;
        } else {
            temp.earnings = '';
        }
        return temp;
    });

    const results = await Promise.all(productList);

    return {
        status: 1,
        message: 'Successfully got your product list.',
        data: results,
    };
}