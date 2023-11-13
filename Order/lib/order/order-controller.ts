import { Connection } from "typeorm";
import { findDiscountPricewithSku, findSpecialPriceWithSku, findTirePrice } from "./service/order-service";
import { hashPassword } from "./service/order-service-utils";
import moment from "moment";

export const orderCreate = async (
    _connection: Connection,
    payload: {
        checkoutPayload: any,
        pluginModule: string[],
        ipAddress: string,
        customerId: number,
        storeRedirectUrl: string,
        adminRedirectUrl: string,
        baseUrl: string,
        dirName: string,
    }
): Promise<{
    status: number,
    message: string,
    data?: any,
}> => {

    const orderService = _connection.getRepository('Order');
    const orderProductService = _connection.getRepository('OrderProduct');
    const orderTotalService = _connection.getRepository('OrderTotal');
    const customerService = _connection.getRepository('Customer');
    const productService = _connection.getRepository('Product');
    const productImageService = _connection.getRepository('ProductImage');
    const settingService = _connection.getRepository('Settings');
    const emailTemplateService = _connection.getRepository('EmailTemplate');
    const orderLogService = _connection.getRepository('OrderLog');
    const countryService = _connection.getRepository('Country');
    const pluginService = _connection.getRepository('Plugins');
    const currencyService = _connection.getRepository('Currency');
    const userService = _connection.getRepository('User');
    const orderProductLogService = _connection.getRepository('OrderProductLog');
    const customerCartService = _connection.getRepository('CustomerCart');
    const stockLogService = _connection.getRepository('StockLog');
    const productStockAlertService = _connection.getRepository('ProductStockAlert');
    const taxService = _connection.getRepository('Tax');
    const skuService = _connection.getRepository('Sku');
    const vendorProductService = _connection.getRepository('VendorProducts');
    const vendorService = _connection.getRepository('Vendor');
    const vendorGroupService = _connection.getRepository('VendorGroup');
    const vendorSettingService = _connection.getRepository('VendorGlobalSetting');
    const vendorOrderService = _connection.getRepository('VendorOrders');
    const vendorOrderLogService = _connection.getRepository('VendorOrderLog');
    const vendorInvoiceService = _connection.getRepository('VendorInvoice');
    const vendorInvoiceItemService = _connection.getRepository('VendorInvoiceItem');

    const newCustomerMail = {} as any;
    const codAdminMail = {} as any;
    const codCustomerMail = {} as any;

    const checkoutParam = payload.checkoutPayload;

    const logo = await settingService.findOne();
    const coupon = {
        couponCode: checkoutParam.couponCode,
        couponData: checkoutParam.couponData,
        couponDiscount: checkoutParam.couponDiscountAmount,
    };

    // Coupon Validation
    if (payload.pluginModule.includes('Coupon')) {

        const importPath = payload.dirName + '/../../../../add-ons/Coupon/coupon';
        const Coupon = await require(importPath);
        const pluginResponse: any = await Coupon.process(coupon);

        if (pluginResponse === 'error') {
            return {
                status: 0,
                message: 'Invalid Coupon',
            }
        }
    }
    // --

    const dynamicData: any = {};
    const orderProducts: any = checkoutParam.productDetails;

    for (const val of orderProducts) {
        /// for find product price with tax , option price, special, discount and tire price /////
        let price: any;
        let taxType: any;
        let taxValue: any;
        let tirePrice: any;
        let priceWithTax: any;
        const productTire: any = await productService.findOne({ where: { productId: val.productId } });
        taxType = productTire.taxType;
        if (taxType === 2 && taxType) {
            const tax: any = await taxService.findOne({ where: { taxId: productTire.taxValue } });
            taxValue = (tax !== undefined) ? tax.taxPercentage : 0;
        } else if (taxType === 1 && taxType) {
            taxValue = productTire.taxValue;
        }
        const sku: any = await skuService.findOne({ where: { skuName: val.skuName } });
        if (sku) {
            if (productTire.hasTirePrice === 1) {
                const findWithQty = await findTirePrice(_connection, val.productId, sku.id, val.quantity);
                if (findWithQty) {
                    tirePrice = findWithQty.price;
                } else {
                    const dateNow = new Date();
                    const todaydate = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
                    const productSpecial = await findSpecialPriceWithSku(_connection, val.productId, sku.id, todaydate);
                    const productDiscount = await findDiscountPricewithSku(_connection, val.productId, sku.id, todaydate);
                    if (productSpecial !== undefined) {
                        tirePrice = productSpecial.price;
                    } else if (productDiscount !== undefined) {
                        tirePrice = productDiscount.price;
                    } else {
                        tirePrice = sku.price;
                    }
                }
                if (taxType && taxType === 2) {
                    const percentVal = +tirePrice * (+taxValue / 100);
                    priceWithTax = +tirePrice + +percentVal;
                } else if (taxType && taxType === 1) {
                    priceWithTax = +tirePrice + +val.taxValue;
                } else {
                    priceWithTax = +tirePrice;
                }
                price = priceWithTax;
            } else {
                const dateNow = new Date();
                const todaydate = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
                const productSpecial = await findSpecialPriceWithSku(_connection, val.productId, sku.id, todaydate);
                const productDiscount = await findDiscountPricewithSku(_connection, val.productId, sku.id, todaydate);
                if (productSpecial !== undefined) {
                    tirePrice = productSpecial.price;
                } else if (productDiscount !== undefined) {
                    tirePrice = productDiscount.price;
                } else {
                    tirePrice = sku.price;
                }
                if (taxType && taxType === 2) {
                    const perVal = +tirePrice * (+taxValue / 100);
                    priceWithTax = +tirePrice + +perVal;
                } else if (taxType && taxType === 1) {
                    priceWithTax = +tirePrice + +taxValue;
                } else {
                    priceWithTax = +tirePrice;
                }
                price = priceWithTax;
            }
        } else {
            tirePrice = productTire.price;
            if (taxType && taxType === 2) {
                const percentAmt = +tirePrice * (+taxValue / 100);
                priceWithTax = +tirePrice + +percentAmt;
            } else if (taxType && taxType === 1) {
                priceWithTax = +tirePrice + +taxValue;
            } else {
                priceWithTax = +tirePrice;
            }
            price = priceWithTax;
        }
        ///// finding price from backend ends /////
        const obj: any = {};
        obj.skuPrice = sku ? sku.price : productTire.price;
        obj.skuId = sku ? sku.id : productTire.skuId;
        obj.price = price;
        obj.taxType = taxType;
        obj.taxValue = taxValue;
        obj.tirePrice = tirePrice;
        obj.productTire = productTire;
        obj.quantity = val.quantity;
        dynamicData[val.skuName] = obj;
    }
    for (const val of orderProducts) {
        const product: any = await productService.findOne(val.productId);
        const sku: any = await skuService.findOne({ where: { skuName: val.skuName } });
        if (product.hasStock === 1) {
            if (!(+sku.minQuantityAllowedCart <= +val.quantity)) {
                return {
                    status: 0,
                    message: 'Quantity should be greater than min Quantity.',
                };
            } else if (!(+sku.maxQuantityAllowedCart >= +val.quantity)) {
                return {
                    status: 0,
                    message: 'Reached maximum quantity limit',
                };
            }
            if ((+sku.quantity <= 0)) {
                return {
                    status: 0,
                    message: 'item is Out of stock',
                };
            }
            if (!(+sku.quantity >= +val.quantity)) {
                return {
                    status: 0,
                    message: 'Available stock for' + product.name + ' - ' + val.skuName + 'is' + sku.quantity,
                };
            }
        }
    }
    const plugin: any = await pluginService.findOne({ where: { id: checkoutParam.paymentMethod } });
    if (plugin === undefined) {
        return {
            status: 0,
            message: 'Payment method is invalid',
        };
    }
    const newOrder = {} as any;
    const newOrderTotal = {} as any;
    let orderProduct = [];
    let i;
    let n;
    let totalProductAmount;
    let totalAmount = 0;
    const productDetailData = [];
    if (payload.customerId) {
        let customerId;
        customerId = payload.customerId;
        newOrder.customerId = customerId;
    } else {
        const customerEmail = await customerService.findOne({
            where: {
                email: checkoutParam.emailId,
                deleteFlag: 0,
            },
        });
        if (customerEmail === undefined) {
            if (checkoutParam.password) {
                const newUser = {} as any;
                newUser.firstName = checkoutParam.shippingFirstName;
                const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{8,}$/;
                if (!checkoutParam.password.match(pattern)) {
                    const passwordValidatingMessage = [];
                    passwordValidatingMessage.push('Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters');
                    return {
                        status: 0,
                        message: "You have an error in your request's body. Check 'errors' field for more details!",
                        data: { message: passwordValidatingMessage },
                    };
                }
                const partsOfThreeLetters = checkoutParam.emailId.match(/.{3}/g).concat(
                    checkoutParam.emailId.substr(1).match(/.{3}/g),
                    checkoutParam.emailId.substr(2).match(/.{3}/g));
                const matchEmail = new RegExp(partsOfThreeLetters.join('|'), 'i').test(checkoutParam.password);
                if (matchEmail === true) {
                    const validationMessage = [];
                    validationMessage.push('Password must not contain any duplicate part of the email address');
                    return {
                        status: 0,
                        message: "You have an error in your request's body. Check 'errors' field for more details!",
                        data: { message: validationMessage },
                    };
                }
                newUser.password = await hashPassword(checkoutParam.password);
                newUser.email = checkoutParam.emailId;
                newUser.username = checkoutParam.emailId;
                newUser.mobileNumber = checkoutParam.phoneNumber;
                newUser.isActive = 1;
                newUser.ip = payload.ipAddress;
                newUser.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
                newUser.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
                const resultDatas: any = await customerService.save(newUser);
                const emailContents: any = await emailTemplateService.findOne(1);
                const message = emailContents.content.replace('{name}', resultDatas.firstName);
                const redirectUrl = payload.storeRedirectUrl;
                const mailContent: any = {};
                mailContent.logo = logo;
                mailContent.emailContent = message;
                mailContent.redirectUrl = redirectUrl;
                mailContent.productDetailData = undefined;

                newCustomerMail.mailContent = mailContent;
                newCustomerMail.email = resultDatas.email;
                newCustomerMail.subject = emailContents.subject;
                newCustomerMail.bcc = false;
                newCustomerMail.isAttachment = false;
                newCustomerMail.attachmentDetails = '';

                // MAILService.sendMail(mailContent, resultDatas.email, emailContents.subject, false, false, '');

                newOrder.customerId = resultDatas.id;
            } else {
                newOrder.customerId = 0;
            }
        } else {
            return {
                status: 0,
                message: 'Please login for checkout, emailId already exist',
            };
        }
    }
    newOrder.email = checkoutParam.emailId;
    newOrder.telephone = checkoutParam.phoneNumber;
    newOrder.shippingFirstname = checkoutParam.shippingFirstName;
    newOrder.shippingLastname = checkoutParam.shippingLastName;
    newOrder.shippingAddress1 = checkoutParam.shippingAddress_1;
    newOrder.shippingAddress2 = checkoutParam.shippingAddress_2;
    newOrder.shippingCompany = checkoutParam.shippingCompany;
    newOrder.shippingCity = checkoutParam.shippingCity;
    newOrder.shippingZone = checkoutParam.shippingZone;
    newOrder.shippingCountryId = checkoutParam.shippingCountryId;
    const country: any = await countryService.findOne({
        where: {
            countryId: checkoutParam.shippingCountryId,
        },
    });
    if (country) {
        newOrder.shippingCountry = country.name;
    }
    newOrder.shippingPostcode = checkoutParam.shippingPostCode;
    newOrder.shippingAddressFormat = checkoutParam.shippingAddressFormat;
    newOrder.paymentFirstname = checkoutParam.paymentFirstName;
    newOrder.paymentLastname = checkoutParam.paymentLastName;
    newOrder.paymentAddress1 = checkoutParam.paymentAddress_1;
    newOrder.paymentAddress2 = checkoutParam.paymentAddress_2;
    newOrder.paymentCompany = checkoutParam.paymentCompany;
    const paymentCountry: any = await countryService.findOne({
        where: {
            countryId: checkoutParam.paymentCountryId,
        },
    });
    if (paymentCountry) {
        newOrder.paymentCountry = paymentCountry.name;
    }
    newOrder.paymentCity = checkoutParam.paymentCity;
    newOrder.paymentZone = checkoutParam.paymentZone;
    newOrder.paymentPostcode = checkoutParam.paymentPostCode;
    newOrder.paymentMethod = checkoutParam.paymentMethod;
    newOrder.customerGstNo = checkoutParam.taxNumber;
    newOrder.ip = payload.ipAddress;
    newOrder.isActive = 1;
    const setting: any = await settingService.findOne();
    newOrder.orderStatusId = setting ? setting.orderStatus : 0;
    newOrder.invoicePrefix = setting ? setting.invoicePrefix : '';
    const currencyVal: any = await currencyService.findOne(setting.storeCurrencyId);
    newOrder.currencyCode = currencyVal ? currencyVal.code : '';
    newOrder.currencyValue = currencyVal ? currencyVal.value : '';
    newOrder.currencySymbolLeft = currencyVal ? currencyVal.symbolLeft : '';
    newOrder.currencySymbolRight = currencyVal?.symbolRight ?? '';
    newOrder.currencyValue = currencyVal ? currencyVal.value : '';
    newOrder.paymentAddressFormat = checkoutParam.shippingAddressFormat;
    newOrder.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    newOrder.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const orderData: any = await orderService.save(newOrder);
    await orderLogService.save({ orderLogId: undefined, ...orderData });
    // const currencySymbol: any = await currencyService.findOne(setting.storeCurrencyId);
    // console.log(currencySymbol, 'currecncyy..!');
    // orderData.currencyRight = currencySymbol?.symbolRight ?? '';
    // orderData.currencyLeft = currencySymbol ? currencySymbol.symbolLeft : '';
    orderProduct = checkoutParam.productDetails;
    let j = 1;
    for (i = 0; i < orderProduct.length; i++) {
        ///// finding price from backend ends /////
        const dynamicPrices = dynamicData[orderProduct[i].skuName];
        const productDetails = {} as any;
        productDetails.productId = orderProduct[i].productId;
        const nwDate = new Date();
        const odrDate = nwDate.getFullYear() + ('0' + (nwDate.getMonth() + 1)).slice(-2) + ('0' + nwDate.getDate()).slice(-2);
        productDetails.orderProductPrefixId = orderData.invoicePrefix.concat('-' + odrDate + orderData.orderId) + j;
        productDetails.name = orderProduct[i].name;
        productDetails.orderId = orderData.orderId;
        productDetails.quantity = orderProduct[i].quantity;
        productDetails.productPrice = dynamicPrices.price;
        productDetails.basePrice = dynamicPrices.skuPrice;
        productDetails.discountAmount = parseFloat(dynamicPrices.skuPrice) - parseFloat(dynamicPrices.tirePrice);
        productDetails.discountedAmount = productDetails.discountAmount !== 0.00 ? dynamicPrices.tirePrice : '0.00';
        productDetails.taxType = dynamicPrices.taxType;
        productDetails.taxValue = dynamicPrices.taxValue;
        productDetails.total = +orderProduct[i].quantity * dynamicPrices.price;
        productDetails.model = dynamicPrices.productTire.name;
        productDetails.skuName = orderProduct[i].skuName ? orderProduct[i].skuName : '';
        productDetails.orderStatusId = 1;
        productDetails.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
        productDetails.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const productInformation = await orderProductService.save(productDetails);
        await orderProductLogService.save(productInformation);
        // Remove product from Cart..!
        const customerCartCondition = {} as any;
        customerCartCondition.productId = orderProduct[i].productId;
        customerCartCondition.customerId = orderData.customerId;
        if (!payload.customerId && payload.pluginModule.includes('AbandonedCart')) {
            customerCartCondition.ip = orderData.ip;
        }
        const cart: any = await customerCartService.findOne({ where: customerCartCondition });
        if (cart !== undefined) {
            await customerCartService.delete(cart.id);
        }
        // -- VEN
        if (orderProduct[i].vendorId !== 0) {
            const val: any = await vendorProductService.findOne({ where: { productId: orderProduct[i].productId, vendorId: orderProduct[i].vendorId } });
            if (val !== undefined) {
                const vendor: any = await vendorService.findOne({ where: { vendorId: val.vendorId } });
                const vendororders = {} as any;
                vendororders.subOrderId = orderData.invoicePrefix.concat('-' + odrDate + orderData.orderId) + val.vendorId + j;
                vendororders.vendorId = val.vendorId;
                vendororders.orderId = orderData.orderId;
                vendororders.orderProductId = productInformation.orderProductId;
                vendororders.total = productDetails.total;
                vendororders.subOrderStatusId = 1;
                vendororders.commission = 0;
                // const date = new Date();
                vendororders.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
                if (val.vendorProductCommission > 0) {
                    vendororders.commission = val.vendorProductCommission;
                } else {
                    const vendorGroup: any = await vendorGroupService.findOne({
                        select: ['groupId', 'name', 'description', 'commission'],
                        where: {
                            groupId: vendor.vendorGroupId,
                        },
                    });
                    const defaultCommission: any = await vendorSettingService.findOne();
                    const defCommission = defaultCommission.defaultCommission;
                    vendororders.commission = (vendorGroup && vendorGroup.commission) ? vendorGroup.commission : defCommission;
                }
                vendororders.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
                const value = await vendorOrderService.save(vendororders);
                const vendorOrderLog = {} as any;
                vendorOrderLog.vendorOrderId = value.vendorOrderId;
                vendorOrderLog.subOrderId = orderData.invoicePrefix.concat('-' + odrDate + orderData.orderId) + val.vendorId + j;
                vendorOrderLog.vendorId = val.vendorId;
                vendorOrderLog.orderId = orderData.orderId;
                vendorOrderLog.subOrderStatusId = 1;
                vendorOrderLog.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
                vendorOrderLog.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');

                await vendorOrderLogService.save(vendorOrderLog);

                const vendorInvoice = await vendorInvoiceService.findOne({ where: { vendorId: val.vendorId, orderId: orderData.orderId } });
                if (!vendorInvoice) {
                    const newVendorInvoice = {} as any;
                    newVendorInvoice.vendorId = val.vendorId;
                    newVendorInvoice.invoicePrefix = orderData.invoicePrefix;
                    newVendorInvoice.orderId = orderData.orderId;
                    newVendorInvoice.email = checkoutParam.emailId;
                    newVendorInvoice.total = 0;
                    newVendorInvoice.shippingFirstname = checkoutParam.shippingFirstName;
                    newVendorInvoice.shippingLastname = checkoutParam.shippingLastName;
                    newVendorInvoice.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
                    newVendorInvoice.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
                    await vendorInvoiceService.save(newVendorInvoice);
                }
                const vendorInvoiceData: any = await vendorInvoiceService.findOne({ where: { vendorId: val.vendorId, orderId: orderData.orderId } });
                vendorInvoiceData.total = vendorInvoiceData.total + +productDetails.total;
                const stringPad = String(vendorInvoiceData.vendorInvoiceId).padStart(5, '0');
                vendorInvoiceData.invoiceNo = 'INV'.concat(stringPad);

                await vendorInvoiceService.save(vendorInvoiceData);

                const newVendorInvoiceItem = {} as any;
                newVendorInvoiceItem.vendorInvoiceId = vendorInvoiceData.vendorInvoiceId;
                newVendorInvoiceItem.orderProductId = productInformation.orderProductId;
                newVendorInvoiceItem.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
                newVendorInvoiceItem.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
                await vendorInvoiceItemService.save(newVendorInvoiceItem);
            }
        }

        const productImageData: any = await productService.findOne(productInformation.productId);
        // for stock management
        if (productImageData.hasStock === 1) {
            const product: any = await skuService.findOne({ where: { skuName: productInformation.skuName } });
            product.quantity = +product.quantity - +productInformation.quantity;
            const prod: any = await skuService.save(product);
            if (productImageData.isSimplified === 0) {
                const findSku: any = await skuService.findOne({ where: { id: productImageData.skuId } });
                findSku.quantity = +findSku.quantity - +productInformation.quantity;
                await skuService.save(findSku);
            }
            if (+prod.quantity <= +prod.notifyMinQuantity) {
                const productStockAlert = {} as any;
                productStockAlert.productId = productInformation.productId;
                productStockAlert.skuName = productInformation.skuName;
                productStockAlert.mailFlag = 1;
                await productStockAlertService.save(productStockAlert);
            }
            const stockLog = {} as any;
            stockLog.productId = productInformation.productId;
            stockLog.orderId = orderData.orderId;
            stockLog.skuName = productInformation.skuName;
            stockLog.quantity = productInformation.quantity;
            stockLog.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
            await stockLogService.save(stockLog);
        }
        let productImageDetail;
        productImageDetail = await productImageService.findOne({ where: { productId: productInformation.productId, defaultImage: 1 } });
        productImageData.productInformationData = productInformation;
        productImageData.productImage = productImageDetail;
        totalProductAmount = await orderProductService.find({ where: { productId: orderProduct[i].productId, orderId: orderData.orderId, orderProductId: productInformation.orderProductId } });
        for (n = 0; n < totalProductAmount.length; n++) {
            totalAmount += +totalProductAmount[n].total;
        }
        productDetailData.push(productImageData);
        j++;
    }

    // Coupon Code Plugin
    let couponData: {
        total: any,
        couponCode: string,
        discountAmount: any
    } = { total: 0, couponCode: '', discountAmount: 0 };
    if (payload.pluginModule.includes('Coupon')) {
        const importPath = payload.dirName + '/../../../../add-ons/Coupon/coupon';
        const Coupon = await require(importPath);
        couponData = await Coupon.process(coupon, orderData, dynamicData, totalAmount);
    }
    // ---

    newOrder.invoiceNo = 'INV00'.concat(orderData.orderId);
    const nowDate = new Date();
    const orderDate = nowDate.getFullYear() + ('0' + (nowDate.getMonth() + 1)).slice(-2) + ('0' + nowDate.getDate()).slice(-2);
    newOrder.orderPrefixId = setting.invoicePrefix.concat('-' + orderDate + orderData.orderId);
    newOrderTotal.orderId = orderData.orderId;
    newOrderTotal.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    newOrderTotal.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    if (couponData.discountAmount) {
        newOrder.total = couponData.total;
        newOrder.couponCode = couponData.couponCode;
        newOrder.discountAmount = couponData.discountAmount;
        newOrder.amount = totalAmount;
        newOrderTotal.value = totalAmount - couponData.discountAmount;
    } else {
        newOrder.amount = totalAmount;
        newOrder.total = totalAmount;
        newOrderTotal.value = totalAmount;
    }
    await orderService.update(orderData.orderId, newOrder);
    await orderTotalService.save(newOrderTotal);
    if (plugin.pluginName === 'CashOnDelivery') {
        const emailContent: any = await emailTemplateService.findOne(5);
        const adminEmailContent: any = await emailTemplateService.findOne(6);
        const today = ('0' + nowDate.getDate()).slice(-2) + '.' + ('0' + (nowDate.getMonth() + 1)).slice(-2) + '.' + nowDate.getFullYear();
        const customerFirstName = orderData.shippingFirstname;
        const customerLastName = orderData.shippingLastname;
        const customerName = customerFirstName + ' ' + customerLastName;
        const adminMessage = adminEmailContent.content.replace('{adminname}', 'Admin').replace('{name}', customerName).replace('{orderId}', orderData.orderId);
        const customerMessage = emailContent.content.replace('{name}', customerName);
        const adminId: any = [];
        const adminUser: any = await userService.find({ select: ['username'], where: { userGroupId: 1, deleteFlag: 0 } });
        for (const user of adminUser) {
            const val = user.username;
            adminId.push(val);
        }
        const adminRedirectUrl = payload.adminRedirectUrl;
        const adminMailContents: any = {};
        adminMailContents.logo = logo;
        adminMailContents.emailContent = adminMessage;
        adminMailContents.redirectUrl = adminRedirectUrl;
        adminMailContents.productDetailData = productDetailData;
        adminMailContents.today = today;
        adminMailContents.orderData = orderData;

        codAdminMail.adminMailContents = adminMailContents;
        codAdminMail.adminId = adminId;
        codAdminMail.subject = adminEmailContent.subject;
        codAdminMail.bcc = false;
        codAdminMail.isAttachment = false;
        codAdminMail.attachmentDetails = '';

        // MAILService.sendMail(adminMailContents, adminId, adminEmailContent.subject, false, false, '');

        const storeRedirectUrl = payload.storeRedirectUrl;
        const storeMailContents: any = {};
        storeMailContents.logo = logo;
        storeMailContents.emailContent = customerMessage;
        storeMailContents.redirectUrl = storeRedirectUrl;
        storeMailContents.productDetailData = productDetailData;
        storeMailContents.today = today;
        storeMailContents.orderData = orderData;

        codCustomerMail.storeMailContents = storeMailContents;
        codCustomerMail.email = orderData.email;
        codCustomerMail.subject = emailContent.subject;
        codCustomerMail.bcc = false;
        codCustomerMail.isAttachment = false;
        codCustomerMail.attachmentDetails = '';

        // MAILService.sendMail(storeMailContents, orderData.email, emailContent.subject, false, false, '');

        const order: any = await orderService.findOne(orderData.orderId);
        order.paymentType = plugin ? plugin.pluginName : '';
        order.productDetail = await orderProductService.find({ where: { orderId: orderData.orderId } }).then((val) => {
            const productImage = val.map(async (value: any) => {
                let image;
                image = await productImageService.findOne({ where: { productId: value.productId } });
                const temp: any = value;
                temp.image = image;
                return temp;
            });
            const results = Promise.all(productImage);
            return results;
        });
        return {
            status: 1,
            message: 'You have successfully placed order. order details sent to your mail',
            data: { order, email: { newCustomerMail, codAdminMail, codCustomerMail } },
        };
    } else {

        const pluginInfo = JSON.parse(plugin.pluginAdditionalInfo);
        orderData.paymentProcess = 0;
        await orderService.update(orderData.orderId, orderData);
        let route = payload.baseUrl + pluginInfo.processRoute + '/' + orderData.orderPrefixId;
        if (plugin.pluginName === 'razorpay' && checkoutParam.isMobile) {
            route = payload.baseUrl + pluginInfo.processAPIRoute + '/' + orderData.orderPrefixId;
            return {
                status: 4,
                message: 'Redirect to this url',
                data: { route, email: { newCustomerMail } },
            };
        }
        return {
            status: 3,
            message: 'Redirect to this url',
            data: { route, email: { newCustomerMail } },
        };
    }
}