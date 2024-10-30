import moment from 'moment';
import { Connection } from "typeorm";
import { instanceToPlain } from 'class-transformer';
import { listByQueryBuilder } from "./service/product-service";
import { escapeChar, validate_slug } from './service/product-service-utils';

export const productCreate = async (payload: any, _connection: any): Promise<{
    status: number,
    message: string,
    data?: object
}> => {

    const skuService = _connection.getRepository('Sku');
    const categoryService = _connection.getRepository('Category');
    const productService = _connection.getRepository('Product');
    const productToCategoryService = _connection.getRepository('ProductToCategory');
    const productImageService = _connection.getRepository('ProductImage');
    const productDiscountService = _connection.getRepository('ProductDiscount');
    const productSpecialService = _connection.getRepository('ProductSpecial');
    const productTirePriceService = _connection.getRepository('ProductTirePrice');
    const productVideoService = _connection.getRepository('ProductVideo');

    const product = payload;
    const category = product.categoryId;
    if (!category?.length) {
        return {
            status: 0,
            message: 'Category should not be empty',
        };
    }
    if ((product.tax < 0)) {
        const errorResponse: any = {
            status: 0,
            message: 'tax should not be in negative',
        };
        return (errorResponse);
    }
    const newProduct = {} as any;
    if (+newProduct.price === 0) {
        return ({
            status: 0,
            message: 'It is mandatory to mention price for the product.',
        });
    }
    const productImage: any = product.image;
    if (productImage.length === 0) {
        return ({
            status: 0,
            message: 'You need to upload at least one image for the product.',
        });
    }
    newProduct.name = product.productName;
    newProduct.description = product.productDescription ? escapeChar(product.productDescription) : '';
    const metaTagTitle = product.productSlug ? product.productSlug : product.productName;
    const slug = metaTagTitle.trim();
    const data = slug.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
    newProduct.productSlug = await validate_slug(_connection, data);
    newProduct.sku = product.sku;
    newProduct.upc = product.upc;
    newProduct.hsn = product.hsn;
    newProduct.quantity = product.quantity ? product.quantity : 1;
    newProduct.quotationAvailable = product.quotationAvailable ? product.quotationAvailable : 0;

    ///// different charges//////
    const serviceCharge: any = {};
    serviceCharge.productCost = product.price;
    serviceCharge.packingCost = product.packingCost ? product.packingCost : 0;
    serviceCharge.shippingCost = product.shippingCost ? product.shippingCost : 0;
    serviceCharge.tax = 0;
    serviceCharge.others = product.others ? product.others : 0;
    newProduct.serviceCharges = JSON.stringify(serviceCharge);
    newProduct.price = serviceCharge.productCost + serviceCharge.packingCost + serviceCharge.shippingCost + serviceCharge.others;
    newProduct.taxType = product.taxType ? product.taxType : 0;
    newProduct.taxValue = product.tax ? product.tax : 0;
    newProduct.stockStatusId = product.outOfStockStatus ? product.outOfStockStatus : 0;
    // saving sku //
    const findSku = await skuService.findOne({ where: { skuName: product.sku } });
    if (findSku) {
        const errorResponse: any = {
            status: 0,
            message: 'Duplicate sku name, give some other name.',
        };
        return (errorResponse);
    }
    const newSku = {} as any;
    newSku.skuName = product.sku;
    newSku.price = newProduct.price;
    newSku.quantity = product.quantity ? product.quantity : 1;
    newSku.isActive = product.status;
    newSku.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    newSku.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const saveSku = await skuService.save(newSku);
    // ending sku //
    newProduct.skuId = saveSku.id;
    newProduct.shipping = product.requiredShipping;
    newProduct.dateAvailable = moment(product.dateAvailable).toISOString();
    newProduct.isActive = product.status;
    newProduct.isFeatured = 0;
    newProduct.todayDeals = 0;
    newProduct.sortOrder = product.sortOrder ? product.sortOrder : 1;
    newProduct.height = (product && product.height) ? product.height : 0;
    newProduct.weight = (product && product.weight) ? product.weight : 0;
    newProduct.length = (product && product.length) ? product.length : 0;
    newProduct.width = (product && product.width) ? product.width : 0;
    newProduct.hasTirePrice = product.hasTirePrice ? product.hasTirePrice : 0;
    const row: any = [];
    if (category.length !== 0) {
        for (const categoryId of category) {
            const categoryNames: any = await categoryService.findOne({
                where: {
                    categoryId,
                },
            });
            const name = '~' + categoryNames.name + '~';
            row.push(name);
        }
        row.push('~' + product.productName + '~');
    }
    const value = row.toString();
    newProduct.keywords = value;
    newProduct.owner = 1;
    newProduct.createdBy = 0;
    newProduct.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    newProduct.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const saveProduct = await productService.save(newProduct);

    // save category
    if (category.length !== 0) {
        for (const categoryId of category) {
            const newProductToCategory = {} as any;
            newProductToCategory.productId = saveProduct.productId;
            newProductToCategory.categoryId = categoryId;
            newProductToCategory.isActive = 1;
            newProductToCategory.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
            newProductToCategory.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
            await productToCategoryService.save(newProductToCategory);
        }
    }

    // Save products Image
    for (const imageRow of productImage) {
        const imageData = JSON.stringify(imageRow);
        const imageResult = JSON.parse(imageData);
        const newProductImage = {} as any;
        newProductImage.productId = saveProduct.productId;
        newProductImage.image = imageResult.image;
        newProductImage.containerName = imageResult.containerName;
        newProductImage.defaultImage = imageResult.defaultImage;
        newProductImage.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
        newProductImage.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        await productImageService.save(newProductImage);
    }

    // Product Discount
    if (product.productDiscount) {
        const productDiscount: any = product.productDiscount;
        for (const discount of productDiscount) {
            const discountData = {} as any;
            discountData.productId = saveProduct.productId;
            discountData.quantity = 1;
            discountData.priority = discount.discountPriority;
            discountData.price = discount.discountPrice;
            discountData.dateStart = moment(discount.discountDateStart).toISOString();
            discountData.dateEnd = moment(discount.discountDateEnd).toISOString();
            discountData.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
            discountData.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
            await productDiscountService.save(discountData);
        }
    }

    // Product Special
    if (product.productSpecial) {
        const productSpecial: any[] = product.productSpecial;
        for (const special of productSpecial) {
            const specialPriceData = {} as any;
            specialPriceData.productId = saveProduct.productId;
            specialPriceData.priority = special.specialPriority;
            specialPriceData.price = special.specialPrice;
            specialPriceData.dateStart = moment(special.specialDateStart).toISOString();
            specialPriceData.dateEnd = moment(special.specialDateEnd).toISOString();
            specialPriceData.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
            specialPriceData.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
            await productSpecialService.save(specialPriceData);
        }
    }

    // Product tire price
    if (product.tirePrices) {
        const tirePrice: any = product.tirePrices;
        for (const tire of tirePrice) {
            const productTirePrice = {} as any;
            productTirePrice.productId = saveProduct.productId;
            productTirePrice.quantity = tire.quantity;
            productTirePrice.price = tire.price;
            productTirePrice.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
            productTirePrice.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
            await productTirePriceService.save(productTirePrice);
        }
    }
    // save product Video
    if (product.productVideo) {
        const video = product.productVideo;
        const productVideo = {} as any;
        productVideo.productId = saveProduct.productId;
        productVideo.name = video.name;
        productVideo.path = video.path;
        productVideo.type = video.type;
        productVideo.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
        productVideo.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        await productVideoService.save(productVideo);
    }
    saveProduct.isSimplified = 1;
    await productService.save(saveProduct);

    return ({
        status: 1,
        message: 'Successfully saved Product.',
        data: saveProduct,
    });
}

enum productCol {
    productId = 'Product.productId as productId',
    productName = 'Product.name as name',
    description = 'Product.description as description',
    productPrice = 'Product.price as price',
    productSlug = 'Product.productSlug as productSlug',
    quantity = 'Product.quantity as quantity',
    keywords = 'Product.keywords as keywords',
    isActive = 'Product.isActive as isActive',
    dateAvailable = 'Product.dateAvailable as dateAvailable',
    width = 'Product.width as width',
    height = 'Product.height as height',
    length = 'Product.length as length',
    weight = 'Product.weight as weight',
    image = '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as image',
    containerName = '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
    defaultImage = '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
    sku = '(SELECT sku.sku_name as sku FROM sku WHERE sku.id = skuId) as sku',
    price = '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price',
    modifiedPrice = '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as modifiedPrice',
    productDiscount = '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
    productSpecial = '(SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial',
}

export const productList = async (
    _connection: Connection,
    select: (keyof typeof productCol)[],
    limit: number,
    offset: number,
    keyword: string,
    productName: string,
    sku: string,
    status: string,
    price: number,
    count: number | boolean,
): Promise<any> => {

    const columns = ['Product.skuId as skuId', ...select.map((col) => productCol[col])];
    const relations = [];
    const groupBy = [];
    const WhereConditions = [];

    if (sku) {
        WhereConditions.push({
            name: 'Product.sku',
            op: 'like',
            value: sku,
        });
    }
    if (status) {
        WhereConditions.push({
            name: 'Product.isActive',
            op: 'and',
            value: status,
        });
    }
    const searchConditions = [];
    const searchConditionName = ['Product.name'];
    if (keyword !== '') {
        searchConditions.push(
            {
                name: searchConditionName,
                value: keyword,
            }
        );
    } else if (productName?.trim()) {
        searchConditions.push(
            {
                name: searchConditionName,
                value: productName,
            }
        );
    }
    const sort = [];
    if (+price && price === 1) {
        sort.push({
            name: 'Product.price',
            order: 'ASC',
        });
    } else if (+price && price === 2) {
        sort.push({
            name: 'Product.price',
            order: 'DESC',
        });
    } else {
        sort.push({
            name: 'Product.createdDate',
            order: 'DESC',
        });
    }
    const productLists: any = await listByQueryBuilder(_connection, limit, offset, columns, WhereConditions, searchConditions, relations, groupBy, sort, false, true);
    if (count) {
        const productListCount: any = await listByQueryBuilder(_connection, limit, offset, columns, WhereConditions, searchConditions, relations, groupBy, sort, true, true);
        return {
            status: 1,
            message: 'Successfully got product lists count.',
            data: productListCount,
        };
    }
    const productList = productLists.map(async (value: any) => {
        const temp: any = value;
        const date = moment(value.dateAvailable).format('YYYY-MM-DD');
        const currentDate = moment().format('YYYY-MM-DD');
        if (currentDate >= date && value.isActive === 1) {
            temp.globe = 1;
        } else {
            temp.globe = 0;
        }
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
        return temp;
    });
    const results = await Promise.all(productList);

    return {
        status: 1,
        message: 'Successfully got the complete product list.',
        data: instanceToPlain(results),
    };
}