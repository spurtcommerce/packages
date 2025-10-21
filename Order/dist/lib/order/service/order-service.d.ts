import { DataSource } from "typeorm";
export declare const findTirePrice: (_connection: DataSource, productId: number, skuId: string, quantity: number) => Promise<any>;
export declare const findSpecialPriceWithSku: (_connection: DataSource, productId: number, skuId: number, todaydate: string) => Promise<any>;
export declare const findDiscountPricewithSku: (_connection: DataSource, productId: number, skuId: number, todaydate: string) => Promise<any>;
