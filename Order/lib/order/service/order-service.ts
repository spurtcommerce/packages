import { Connection } from "typeorm";

export const findTirePrice = async (_connection: Connection, productId: number, skuId: string, quantity: number): Promise<any> => {

    const query: any = await _connection.manager.createQueryBuilder('ProductTirePrice', 'productTirePrice');
    query.select(['productTirePrice.price as price', 'productTirePrice.quantity as quantity', 'productTirePrice.productId as productId']);
    query.where('productTirePrice.productId = ' + productId);
    query.where('productTirePrice.skuId = ' + skuId);
    query.andWhere('productTirePrice.quantity <= ' + quantity);
    query.orderBy('productTirePrice.quantity', 'DESC');
    query.limit('1');
    return query.getRawOne();
}

export const findSpecialPriceWithSku = async (_connection: Connection, productId: number, skuId: number, todaydate: string): Promise<any> => {

    const query: any = await _connection.manager.createQueryBuilder('ProductSpecial', 'productSpecial');
    query.select(['productSpecial.price as price', 'productSpecial.dateStart as dateStart', 'productSpecial.dateEnd as dateEnd', 'productSpecial.skuId as skuId']);
    query.where('productSpecial.productId = ' + productId);
    query.andWhere('productSpecial.skuId = ' + skuId);
    query.andWhere('(productSpecial.dateStart <= :todaydate AND productSpecial.dateEnd >= :todaydate)', { todaydate });
    query.orderBy('productSpecial.priority', 'ASC');
    query.addOrderBy('productSpecial.price', 'ASC');
    query.limit('1');
    return query.getRawOne();
}

export const findDiscountPricewithSku = async (_connection: Connection, productId: number, skuId: number, todaydate: string): Promise<any> => {

    const query: any = await _connection.manager.createQueryBuilder('ProductDiscount', 'productDiscount');
    query.select(['productDiscount.price as price', 'productDiscount.dateStart as dateStart', 'productDiscount.dateEnd as dateEnd']);
    query.where('productDiscount.productId = ' + productId);
    query.where('productDiscount.skuId = ' + skuId);
    query.andWhere('(productDiscount.dateStart <= :todaydate AND productDiscount.dateEnd >= :todaydate)', { todaydate });
    query.orderBy('productDiscount.priority', 'ASC');
    query.addOrderBy('productDiscount.price', 'ASC');
    query.limit('1');
    return query.getRawOne();
}