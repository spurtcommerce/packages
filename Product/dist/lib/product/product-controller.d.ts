import { Connection } from "typeorm";
export declare const productCreate: (payload: any, _connection: any) => Promise<{
    status: number;
    message: string;
    data?: object;
}>;
declare enum productCol {
    productId = "Product.productId as productId",
    productName = "Product.name as name",
    description = "Product.description as description",
    productPrice = "Product.price as price",
    productSlug = "Product.productSlug as productSlug",
    quantity = "Product.quantity as quantity",
    keywords = "Product.keywords as keywords",
    isActive = "Product.isActive as isActive",
    dateAvailable = "Product.dateAvailable as dateAvailable",
    width = "Product.width as width",
    height = "Product.height as height",
    length = "Product.length as length",
    weight = "Product.weight as weight",
    image = "(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as image",
    containerName = "(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as containerName",
    defaultImage = "(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage",
    sku = "(SELECT sku.sku_name as sku FROM sku WHERE sku.id = skuId) as sku",
    price = "(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price",
    modifiedPrice = "(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as modifiedPrice",
    productDiscount = "(SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE()))  ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount",
    productSpecial = "(SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE())) ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial"
}
export declare const productList: (_connection: Connection, select: (keyof typeof productCol)[], limit: number, offset: number, keyword: string, productName: string, sku: string, status: string, price: number, count: number | boolean) => Promise<any>;
export {};
