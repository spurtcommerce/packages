import { Connection } from "typeorm";
export declare const findTirePrice: (_connection: Connection, productId: number, skuId: string, quantity: number) => Promise<any>;
export declare const findSpecialPriceWithSku: (_connection: Connection, productId: number, skuId: number, todaydate: string) => Promise<any>;
export declare const findDiscountPricewithSku: (_connection: Connection, productId: number, skuId: number, todaydate: string) => Promise<any>;
