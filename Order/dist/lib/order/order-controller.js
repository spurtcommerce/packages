"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderCreate = void 0;
const tslib_1 = require("tslib");
const order_service_1 = require("./service/order-service");
const order_service_utils_1 = require("./service/order-service-utils");
const moment_1 = (0, tslib_1.__importDefault)(require("moment"));
const orderCreate = (_connection, payload) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _f, _g, _h;
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
    const addressService = _connection.getRepository('Address');
    const productToCategoryService = _connection.getRepository('ProductToCategory');
    const newCustomerMail = {};
    const codAdminMail = {};
    const codCustomerMail = {};
    const stockNotifyMails = {};
    const checkoutParam = payload.checkoutPayload;
    const logo = yield settingService.findOne({ where: {} });
    const coupon = {
        couponCode: checkoutParam.couponCode,
        couponData: checkoutParam.couponData,
        couponDiscount: checkoutParam.couponDiscountAmount,
    };
    // Coupon Validation
    if (payload.pluginModule.includes('Coupon')) {
        const importPath = payload.dirName + '/../../../../add-ons/Coupon/coupon';
        const Coupon = yield require(importPath);
        const pluginResponse = yield Coupon.process(coupon);
        if (pluginResponse === 'error') {
            return { status: 0, message: 'Invalid Coupon' };
        }
    }
    const dynamicData = {};
    const orderProducts = checkoutParam.productDetails;
    let priceGroupAddonExist = false;
    let customerPriceBySkuAndCustomerId;
    if (payload.pluginModule.includes('ProductPriceGroup') && (yield pluginService.findOne({ where: { slugName: 'product-price-group', pluginStatus: 1 } }))) {
        priceGroupAddonExist = true;
        const importPath = payload.dirName + '/../../../../add-ons/ProductPriceGroup/priceGroupHook';
        const { getCustomerPriceBySkuAndCustomerId } = require(importPath);
        customerPriceBySkuAndCustomerId = getCustomerPriceBySkuAndCustomerId;
    }
    for (const val of orderProducts) {
        let price;
        let taxType;
        let taxValue;
        let tirePrice = 0;
        let priceWithTax;
        let priceGroupDetailId = 0;
        const productTire = yield productService.findOne({ where: { productId: val.productId } });
        taxType = productTire.taxType;
        if (taxType === 2 && taxType) {
            const tax = yield taxService.findOne({ where: { taxId: productTire.taxValue } });
            taxValue = (tax) ? tax.taxPercentage : 0;
        }
        else if (taxType === 1 && taxType) {
            taxValue = productTire.taxValue;
        }
        const sku = yield skuService.findOne({ where: { skuName: val.skuName } });
        if (sku) {
            const customerPrice = [];
            if (priceGroupAddonExist) {
                customerPrice.push(...(yield customerPriceBySkuAndCustomerId(sku.id, payload.customerId)));
            }
            if (customerPrice.length) {
                const customerPriceSort = customerPrice.sort((a, b) => b.maxQuantity - a.maxQuantity);
                const priceByQuantity = customerPriceSort.find((custPrice) => val.quantity >= custPrice.maxQuantity);
                if (priceByQuantity) {
                    tirePrice = priceByQuantity.price;
                    priceGroupDetailId = priceByQuantity.id;
                }
            }
            let promotionPrice;
            if (payload.pluginModule.includes('Promotion') && (yield pluginService.findOne({ where: { slugName: 'promotion', pluginStatus: 1 } }))) {
                const importPath = payload.dirName + '/../../../../add-ons/Promotion/PromotionResolver';
                const { getApplicablePromotion } = require(importPath);
                const product = yield productToCategoryService.find({ where: { productId: val.productId } });
                const categoryIds = product.map(x => x.categoryId);
                const promotion = yield getApplicablePromotion(val.vendorId, categoryIds);
                if (promotion) {
                    const originalPrice = Number(val.productPrice);
                    const promotionAmount = Number(promotion.promotionAmount);
                    promotionPrice = Number((originalPrice - (originalPrice * promotionAmount) / 100).toFixed(2));
                }
            }
            if (!tirePrice) {
                const findWithQty = yield (0, order_service_1.findTirePrice)(_connection, val.productId, sku.id, val.quantity);
                if (findWithQty) {
                    tirePrice = findWithQty.price;
                }
                else if (promotionPrice) {
                    tirePrice = +promotionPrice;
                }
                else {
                    const dateNow = new Date();
                    const todaydate = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
                    const productSpecial = yield (0, order_service_1.findSpecialPriceWithSku)(_connection, val.productId, sku.id, todaydate);
                    const productDiscount = yield (0, order_service_1.findDiscountPricewithSku)(_connection, val.productId, sku.id, todaydate);
                    if (productSpecial) {
                        tirePrice = productSpecial.price;
                    }
                    else if (productDiscount) {
                        tirePrice = productDiscount.price;
                    }
                    else {
                        tirePrice = sku.price;
                    }
                }
            }
        }
        else {
            tirePrice = productTire.price;
        }
        if (taxType && taxType === 2) {
            const percentAmt = +tirePrice * (+taxValue / 100);
            priceWithTax = +tirePrice + +percentAmt;
        }
        else if (taxType && taxType === 1) {
            priceWithTax = +tirePrice + +taxValue;
        }
        else {
            priceWithTax = +tirePrice;
        }
        price = priceWithTax;
        const obj = {};
        obj.skuPrice = sku ? sku.price : productTire.price;
        obj.skuId = sku ? sku.id : productTire.skuId;
        obj.price = price;
        obj.taxType = taxType;
        obj.taxValue = taxValue;
        obj.tirePrice = tirePrice;
        obj.productTire = productTire;
        obj.quantity = (_a = val.quantity) !== null && _a !== void 0 ? _a : 1;
        obj.priceGroupDetailId = priceGroupDetailId;
        dynamicData[val.skuName] = obj;
    }
    for (const val of orderProducts) {
        const product = yield productService.findOne({ where: { productId: val.productId } });
        const sku = yield skuService.findOne({ where: { skuName: val.skuName } });
        if (product.productType === 'physical' && product.hasStock === 1) {
            if (!(+sku.minQuantityAllowedCart <= +val.quantity)) {
                return { status: 0, message: 'Quantity should be greater than min Quantity.' };
            }
            else if (!(+sku.maxQuantityAllowedCart >= +val.quantity)) {
                return { status: 0, message: 'Reached maximum quantity limit' };
            }
            if ((+sku.quantity <= 0)) {
                return { status: 0, message: 'item is Out of stock' };
            }
            if (!(+sku.quantity >= +val.quantity)) {
                return { status: 0, message: `Available stock for ${product.name} - ${val.skuName} is ${sku.quantity}` };
            }
        }
    }
    const plugin = yield pluginService.findOne({ where: { id: checkoutParam.paymentMethod } });
    if (!plugin) {
        return { status: 0, message: 'Payment method is invalid' };
    }
    if (checkoutParam.productType !== 'physical' && plugin.pluginName === 'CashOnDelivery') {
        return { status: 0, message: 'Payment method is invalid' };
    }
    // WALLET CHANGE 1: validate wallet balance before creating the order.
    // Amount is validated again after totals are computed (see WALLET CHANGE 2).
    // This early check prevents order creation for obvious insufficient balance.
    // Uses a pre-flight estimate — final authoritative check is at deduction time.
    if (plugin.pluginName === 'Wallet' && payload.pluginModule.includes('Wallet')) {
        try {
            const walletHook = require(payload.dirName + '/../../../../add-ons/Wallet/walletOrderHook');
            // Use dynamicData to compute an estimated total for early validation
            const estimatedTotal = Object.values(dynamicData).reduce((sum, item) => {
                return sum + (+item.price * +item.quantity);
            }, 0);
            const validation = yield walletHook.validateWalletPayment(payload.customerId, estimatedTotal);
            if (!validation.valid) {
                return { status: 0, message: validation.message };
            }
        }
        catch (_e) {
            return { status: 0, message: 'Wallet payment is not available.' };
        }
    }
    const newOrder = {};
    const newOrderTotal = {};
    let orderProduct = [];
    let i;
    let n;
    let totalProductAmount;
    let totalAmount = 0;
    const productDetailData = [];
    if (payload.customerId) {
        newOrder.customerId = payload.customerId;
    }
    else {
        const customerEmail = yield customerService.findOne({ where: { email: checkoutParam.emailId, deleteFlag: 0 } });
        if (!customerEmail) {
            if (checkoutParam.password) {
                const newUser = {};
                newUser.firstName = checkoutParam.shippingFirstName;
                newUser.lastName = checkoutParam.shippingLastName;
                const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{8,}$/;
                if (!checkoutParam.password.match(pattern)) {
                    const passwordValidatingMessage = [];
                    passwordValidatingMessage.push('Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters');
                    return { status: 0, message: "You have an error in your request's body. Check 'errors' field for more details!", data: { message: passwordValidatingMessage } };
                }
                newUser.password = yield (0, order_service_utils_1.hashPassword)(checkoutParam.password);
                newUser.email = checkoutParam.emailId;
                newUser.username = checkoutParam.emailId;
                newUser.mobileNumber = checkoutParam.phoneNumber;
                newUser.isActive = 1;
                newUser.siteId = payload.siteId;
                newUser.ip = payload.ipAddress;
                newUser.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                newUser.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                const resultDatas = yield customerService.save(newUser);
                const newAddress = {};
                newAddress.firstName = checkoutParam.shippingFirstName;
                newAddress.lastName = (_b = checkoutParam.shippingLastName) !== null && _b !== void 0 ? _b : '';
                newAddress.customerId = resultDatas.id;
                newAddress.address1 = checkoutParam.shippingAddress_1;
                newAddress.address2 = checkoutParam.shippingAddress_2;
                newAddress.city = checkoutParam.shippingCity;
                newAddress.state = (_c = checkoutParam.shippingZone) !== null && _c !== void 0 ? _c : '';
                newAddress.zoneId = (_d = checkoutParam.state) !== null && _d !== void 0 ? _d : 0;
                newAddress.countryId = checkoutParam.shippingCountryId;
                newAddress.postcode = checkoutParam.shippingPostCode;
                newAddress.addressType = 0;
                newAddress.company = (_f = checkoutParam.shippingCompany) !== null && _f !== void 0 ? _f : '';
                newAddress.landmark = '';
                newAddress.phoneNo = checkoutParam.phoneNumber;
                yield addressService.save(newAddress);
                const emailContents = yield emailTemplateService.findOne({ where: { emailTemplateId: 1 } });
                const message = emailContents.content.replace('{name}', resultDatas.firstName);
                const mailContent = {};
                mailContent.logo = logo;
                mailContent.emailContent = message;
                mailContent.redirectUrl = payload.storeRedirectUrl;
                mailContent.productDetailData = undefined;
                newCustomerMail.mailContent = mailContent;
                newCustomerMail.email = resultDatas.email;
                newCustomerMail.subject = emailContents.subject;
                newCustomerMail.bcc = false;
                newCustomerMail.isAttachment = false;
                newCustomerMail.attachmentDetails = '';
                newOrder.customerId = resultDatas.id;
            }
            else {
                newOrder.customerId = 0;
            }
        }
        else {
            return { status: 0, message: 'Please login for checkout, emailId already exist' };
        }
    }
    newOrder.email = checkoutParam.emailId;
    newOrder.telephone = checkoutParam.phoneNumber;
    if (checkoutParam.productType === 'physical') {
        newOrder.shippingFirstname = checkoutParam.shippingFirstName;
        newOrder.shippingLastname = checkoutParam.shippingLastName;
        newOrder.shippingAddress1 = checkoutParam.shippingAddress_1;
        newOrder.shippingAddress2 = checkoutParam.shippingAddress_2;
        newOrder.shippingCompany = checkoutParam.shippingCompany;
        newOrder.shippingCity = checkoutParam.shippingCity;
        newOrder.shippingZone = checkoutParam.shippingZone;
        newOrder.shippingCountryId = checkoutParam.shippingCountryId;
        const country = yield countryService.findOne({ where: { countryId: checkoutParam.shippingCountryId } });
        if (country) {
            newOrder.shippingCountry = country.name;
        }
        newOrder.shippingPostcode = checkoutParam.shippingPostCode;
        newOrder.shippingAddressFormat = checkoutParam.shippingAddressFormat;
    }
    else {
        newOrder.shippingFirstname = '';
        newOrder.shippingLastname = '';
        newOrder.shippingAddress1 = '';
        newOrder.shippingAddress2 = '';
        newOrder.shippingCompany = '';
        newOrder.shippingCity = '';
        newOrder.shippingZone = '';
        newOrder.shippingCountryId = 0;
        newOrder.shippingCountry = '';
        newOrder.shippingPostcode = '';
        newOrder.shippingAddressFormat = '';
    }
    newOrder.paymentFirstname = checkoutParam.paymentFirstName;
    newOrder.paymentLastname = checkoutParam.paymentLastName;
    newOrder.paymentAddress1 = checkoutParam.paymentAddress_1;
    newOrder.paymentAddress2 = checkoutParam.paymentAddress_2;
    newOrder.paymentMobileNumber = checkoutParam.paymentMobileNumber;
    newOrder.paymentCompany = checkoutParam.paymentCompany;
    const paymentCountry = yield countryService.findOne({ where: { countryId: checkoutParam.paymentCountryId } });
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
    const setting = yield settingService.findOne({ where: { settingsId: payload.siteId } });
    newOrder.orderStatusId = setting ? setting.orderStatus : 0;
    newOrder.invoicePrefix = setting ? setting.invoicePrefix : '';
    const currencyVal = yield currencyService.findOne({ where: { currencyId: setting.storeCurrencyId } });
    newOrder.currencyCode = currencyVal ? currencyVal.code : '';
    newOrder.currencyValue = currencyVal ? currencyVal.value : '';
    newOrder.currencySymbolLeft = currencyVal ? currencyVal.symbolLeft : '';
    newOrder.currencySymbolRight = (_g = currencyVal === null || currencyVal === void 0 ? void 0 : currencyVal.symbolRight) !== null && _g !== void 0 ? _g : '';
    newOrder.paymentAddressFormat = checkoutParam.shippingAddressFormat;
    newOrder.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    newOrder.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    const currencyCode = payload.currencyCode || 'INR';
    let validCurrency = yield currencyService.findOne({ where: { code: currencyCode, isActive: 1 } });
    if (!validCurrency) {
        validCurrency = yield currencyService.findOne({ where: { code: 'INR', isActive: 1 } });
    }
    newOrder.currencyExchangeCode = validCurrency.code;
    newOrder.currencyExchangeSymbolLeft = validCurrency.symbolLeft;
    newOrder.rateUsed = validCurrency.value;
    newOrder.isShoppingCart = (_h = payload.isShoppingCart) !== null && _h !== void 0 ? _h : false;
    const orderData = yield orderService.save(newOrder);
    yield orderLogService.save(Object.assign({ orderLogId: undefined }, orderData));
    orderProduct = checkoutParam.productDetails;
    let j = 1;
    for (i = 0; i < orderProduct.length; i++) {
        const dynamicPrices = dynamicData[orderProduct[i].skuName];
        const productDetails = {};
        productDetails.productId = orderProduct[i].productId;
        const productData = yield productService.findOne({ where: { productId: orderProduct[i].productId } });
        const nwDate = new Date();
        const odrDate = nwDate.getFullYear() + ('0' + (nwDate.getMonth() + 1)).slice(-2) + ('0' + nwDate.getDate()).slice(-2);
        productDetails.orderProductPrefixId = orderData.invoicePrefix.concat('-' + odrDate + orderData.orderId) + j;
        productDetails.name = orderProduct[i].name;
        productDetails.orderId = orderData.orderId;
        productDetails.quantity = productData.productType === 'physical' ? orderProduct[i].quantity : 1;
        productDetails.productPrice = dynamicPrices.price;
        productDetails.basePrice = dynamicPrices.skuPrice;
        productDetails.discountAmount = parseFloat(dynamicPrices.skuPrice) - parseFloat(dynamicPrices.tirePrice);
        productDetails.discountedAmount = productDetails.discountAmount !== 0.00 ? dynamicPrices.tirePrice : '0.00';
        productDetails.taxType = dynamicPrices.taxType;
        productDetails.taxValue = dynamicPrices.taxValue;
        productDetails.total = +orderProduct[i].quantity * dynamicPrices.price;
        productDetails.model = dynamicPrices.productTire.name;
        productDetails.skuName = orderProduct[i].skuName ? orderProduct[i].skuName : '';
        productDetails.priceGroupDetailId = dynamicPrices.priceGroupDetailId;
        productDetails.orderStatusId = 1;
        productDetails.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        productDetails.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        const productInformation = yield orderProductService.save(productDetails);
        yield orderProductLogService.save(productInformation);
        const customerCartCondition = {};
        customerCartCondition.productId = orderProduct[i].productId;
        customerCartCondition.customerId = orderData.customerId;
        if (!payload.customerId && payload.pluginModule.includes('AbandonedCart')) {
            customerCartCondition.ip = orderData.ip;
        }
        const cart = yield customerCartService.findOne({ where: customerCartCondition });
        if (cart) {
            yield customerCartService.delete({ id: cart.id });
        }
        if (payload.isShoppingCart === true && payload.pluginModule.includes('ShoppingCart')) {
            const importPath = payload.dirName + '/../../../../add-ons/ShoppingCart/ShoppingCartHook';
            const shoppingCartHook = yield require(importPath);
            const shoppingCartData = yield shoppingCartHook.findOne({ where: { id: payload.shoppingCartId, customerId: orderData.customerId, isOrdered: 0, isDelete: 0 } });
            if (shoppingCartData) {
                yield shoppingCartHook.update(shoppingCartData.id, { isOrdered: 1 });
            }
        }
        if (orderProduct[i].vendorId !== 0) {
            const val = yield vendorProductService.findOne({ where: { productId: orderProduct[i].productId, vendorId: orderProduct[i].vendorId } });
            if (val) {
                const vendor = yield vendorService.findOne({ where: { vendorId: val.vendorId } });
                const vendororders = {};
                vendororders.subOrderId = orderData.invoicePrefix.concat('-' + odrDate + orderData.orderId) + val.vendorId + j;
                vendororders.vendorId = val.vendorId;
                vendororders.orderId = orderData.orderId;
                vendororders.orderProductId = productInformation.orderProductId;
                vendororders.total = productDetails.total;
                vendororders.subOrderStatusId = 1;
                vendororders.commission = 0;
                vendororders.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                if (val.vendorProductCommission > 0) {
                    vendororders.commission = val.vendorProductCommission;
                }
                else if (vendor.commission > 0) {
                    vendororders.commission = vendor.commission;
                }
                else {
                    const vendorGroup = yield vendorGroupService.findOne({ select: ['groupId', 'name', 'description', 'commission'], where: { groupId: vendor.vendorGroupId } });
                    const defaultCommission = yield vendorSettingService.findOne({ where: {} });
                    const defCommission = defaultCommission.defaultCommission;
                    vendororders.commission = (vendorGroup && vendorGroup.commission) ? vendorGroup.commission : defCommission;
                }
                vendororders.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                const value = yield vendorOrderService.save(vendororders);
                const vendorOrderLog = {};
                vendorOrderLog.vendorOrderId = value.vendorOrderId;
                vendorOrderLog.subOrderId = orderData.invoicePrefix.concat('-' + odrDate + orderData.orderId) + val.vendorId + j;
                vendorOrderLog.vendorId = val.vendorId;
                vendorOrderLog.orderId = orderData.orderId;
                vendorOrderLog.subOrderStatusId = 1;
                vendorOrderLog.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                vendorOrderLog.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                yield vendorOrderLogService.save(vendorOrderLog);
                const vendorInvoice = yield vendorInvoiceService.findOne({ where: { vendorId: val.vendorId, orderId: orderData.orderId } });
                if (!vendorInvoice) {
                    const newVendorInvoice = {};
                    newVendorInvoice.vendorId = val.vendorId;
                    newVendorInvoice.invoicePrefix = orderData.invoicePrefix;
                    newVendorInvoice.orderId = orderData.orderId;
                    newVendorInvoice.email = checkoutParam.emailId;
                    newVendorInvoice.total = 0;
                    newVendorInvoice.shippingFirstname = checkoutParam.shippingFirstName;
                    newVendorInvoice.shippingLastname = checkoutParam.shippingLastName;
                    newVendorInvoice.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                    newVendorInvoice.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                    yield vendorInvoiceService.save(newVendorInvoice);
                }
                const vendorInvoiceData = yield vendorInvoiceService.findOne({ where: { vendorId: val.vendorId, orderId: orderData.orderId } });
                vendorInvoiceData.total = vendorInvoiceData.total + +productDetails.total;
                const stringPad = String(vendorInvoiceData.vendorInvoiceId).padStart(5, '0');
                vendorInvoiceData.invoiceNo = 'INV'.concat(stringPad);
                yield vendorInvoiceService.save(vendorInvoiceData);
                const newVendorInvoiceItem = {};
                newVendorInvoiceItem.vendorInvoiceId = vendorInvoiceData.vendorInvoiceId;
                newVendorInvoiceItem.orderProductId = productInformation.orderProductId;
                newVendorInvoiceItem.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                newVendorInvoiceItem.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                yield vendorInvoiceItemService.save(newVendorInvoiceItem);
            }
        }
        if (productData.productType === 'physical' && productData.hasStock === 1) {
            const skuValue = yield skuService.findOne({ where: { skuName: productInformation.skuName } });
            skuValue.quantity = +skuValue.quantity - +productInformation.quantity;
            const prod = yield skuService.save(skuValue);
            if (productData.isSimplified !== 0) {
                const productValue = yield productService.findOne({ where: { productId: productInformation.productId } });
                productValue.quantity = productValue.quantity - +productInformation.quantity;
                yield productService.save(productValue);
            }
            if (+prod.quantity <= +prod.notifyMinQuantity) {
                const productStockAlert = {};
                productStockAlert.productId = productInformation.productId;
                productStockAlert.skuName = productInformation.skuName;
                productStockAlert.mailFlag = 1;
                yield productStockAlertService.save(productStockAlert);
                const findVendorProduct = yield vendorProductService.findOne({ where: { productId: productInformation.productId }, relations: ['vendor'] });
                const findProductNotifyTemp = yield emailTemplateService.findOne({ where: { emailTemplateId: 46 } });
                if (findVendorProduct) {
                    const customer = yield customerService.findOne({ where: { id: findVendorProduct.vendor.customerId } });
                    const vendorMessage = findProductNotifyTemp.content.replace(/{name}/g, customer.firstName + ' ' + customer.lastName).replace(/{productName}/g, productData.name);
                    const vendorMailContents = {};
                    vendorMailContents.logo = logo;
                    vendorMailContents.productDetailData = undefined;
                    vendorMailContents.emailContent = vendorMessage;
                    vendorMailContents.redirectUrl = payload.vendorRedirectUrl;
                    stockNotifyMails.vendorEmailContents = vendorMailContents;
                    stockNotifyMails.vendorEmail = customer.email;
                    stockNotifyMails.subject = findProductNotifyTemp.subject;
                    stockNotifyMails.bcc = false;
                    stockNotifyMails.isAttachment = false;
                    stockNotifyMails.attachmentDetails = '';
                }
            }
            const stockLog = {};
            stockLog.productId = productInformation.productId;
            stockLog.orderId = orderData.orderId;
            stockLog.skuName = productInformation.skuName;
            stockLog.quantity = productInformation.quantity;
            stockLog.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            yield stockLogService.save(stockLog);
        }
        let productImageDetail;
        productImageDetail = yield productImageService.findOne({ where: { productId: productInformation.productId, defaultImage: 1 } });
        productData.productInformationData = productInformation;
        productData.productImage = productImageDetail;
        totalProductAmount = yield orderProductService.find({ where: { productId: orderProduct[i].productId, orderId: orderData.orderId, orderProductId: productInformation.orderProductId } });
        for (n = 0; n < totalProductAmount.length; n++) {
            totalAmount += +totalProductAmount[n].total;
        }
        productDetailData.push(productData);
        j++;
    }
    // Coupon Code Plugin
    let couponData = { total: 0, couponCode: '', discountAmount: 0 };
    if (payload.pluginModule.includes('Coupon')) {
        const importPath = payload.dirName + '/../../../../add-ons/Coupon/coupon';
        const Coupon = yield require(importPath);
        couponData = yield Coupon.process(coupon, orderData, dynamicData, totalAmount);
    }
    newOrder.invoiceNo = 'INV00'.concat(orderData.orderId);
    const nowDate = new Date();
    const orderDate = nowDate.getFullYear() + ('0' + (nowDate.getMonth() + 1)).slice(-2) + ('0' + nowDate.getDate()).slice(-2);
    newOrder.orderPrefixId = setting.invoicePrefix.concat('-' + orderDate + orderData.orderId);
    newOrderTotal.orderId = orderData.orderId;
    newOrderTotal.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    newOrderTotal.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    if (couponData.discountAmount) {
        newOrder.total = couponData.total;
        newOrder.couponCode = couponData.couponCode;
        newOrder.discountAmount = couponData.discountAmount;
        newOrder.amount = totalAmount;
        newOrderTotal.value = totalAmount - couponData.discountAmount;
    }
    else {
        newOrder.amount = totalAmount;
        newOrder.total = totalAmount;
        newOrderTotal.value = totalAmount;
    }
    yield orderService.update(orderData.orderId, newOrder);
    yield orderTotalService.save(newOrderTotal);
    // WALLET CHANGE 2: final authoritative total is now in newOrder.total (backend-computed,
    // after product prices + coupon). Use this for deduction — never trust frontend price.
    const finalOrderTotal = +newOrder.total;
    if (plugin.pluginName === 'CashOnDelivery') {
        const emailContent = yield emailTemplateService.findOne({ where: { emailTemplateId: 5 } });
        const adminEmailContent = yield emailTemplateService.findOne({ where: { emailTemplateId: 6 } });
        const today = ('0' + nowDate.getDate()).slice(-2) + '.' + ('0' + (nowDate.getMonth() + 1)).slice(-2) + '.' + nowDate.getFullYear();
        const customerFirstName = orderData.shippingFirstname;
        const customerLastName = orderData.shippingLastname;
        const customerName = customerFirstName + ' ' + customerLastName;
        const adminMessage = adminEmailContent.content.replace('{adminname}', 'Admin').replace('{name}', customerName).replace('{orderId}', orderData.orderId);
        const customerMessage = emailContent.content.replace('{name}', customerName);
        const adminId = [];
        const adminUser = yield userService.find({ select: ['username'], where: { userGroupId: 1, deleteFlag: 0 } });
        for (const user of adminUser) {
            adminId.push(user.username);
        }
        const codVendorMails = [];
        const vendorInvoice = yield vendorInvoiceService.find({ where: { orderId: orderData.orderId } });
        if (vendorInvoice.length > 0) {
            for (const vendInvoice of vendorInvoice) {
                const vendorProductDetailData = [];
                const vendor = yield vendorService.findOne({ where: { vendorId: vendInvoice.vendorId } });
                const customer = yield customerService.findOne({ where: { id: vendor.customerId } });
                const vendorMessage = adminEmailContent.content.replace('{adminname}', vendor.companyName).replace('{name}', customerName).replace('{orderId}', orderData.orderId);
                const vendorInvoiceItem = yield vendorInvoiceItemService.find({ where: { vendorInvoiceId: vendInvoice.vendorInvoiceId } });
                for (const vendInvoiceItem of vendorInvoiceItem) {
                    const vendorProductInformation = yield orderProductService.findOne({ where: { orderProductId: vendInvoiceItem.orderProductId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'basePrice', 'skuName', 'taxValue', 'taxType', 'orderProductPrefixId'] });
                    const vendorProductImageData = yield productService.findOne({ where: { productId: vendorProductInformation.productId } });
                    let vendorProductImageDetail;
                    vendorProductImageDetail = yield productImageService.findOne({ where: { productId: vendorProductInformation.productId, defaultImage: 1 } });
                    vendorProductImageData.productInformationData = vendorProductInformation;
                    vendorProductImageData.productImage = vendorProductImageDetail;
                    vendorProductDetailData.push(vendorProductImageData);
                }
                const vendorMailContents = {};
                vendorMailContents.logo = logo;
                vendorMailContents.emailContent = vendorMessage;
                vendorMailContents.redirectUrl = payload.vendorRedirectUrl;
                vendorMailContents.productDetailData = vendorProductDetailData;
                vendorMailContents.today = today;
                vendorMailContents.orderData = orderData;
                const codVendorMail = {};
                codVendorMail.vendorEmailContents = vendorMailContents;
                codVendorMail.vendorEmail = customer.email;
                codVendorMail.subject = adminEmailContent.subject;
                codVendorMail.bcc = false;
                codVendorMail.isAttachment = false;
                codVendorMail.attachmentDetails = '';
                codVendorMails.push(Object.assign({}, codVendorMail));
            }
        }
        const adminMailContents = {};
        adminMailContents.logo = logo;
        adminMailContents.emailContent = adminMessage;
        adminMailContents.redirectUrl = payload.adminRedirectUrl;
        adminMailContents.productDetailData = productDetailData;
        adminMailContents.today = today;
        adminMailContents.orderData = orderData;
        codAdminMail.adminMailContents = adminMailContents;
        codAdminMail.adminId = adminId;
        codAdminMail.subject = adminEmailContent.subject;
        codAdminMail.bcc = false;
        codAdminMail.isAttachment = false;
        codAdminMail.attachmentDetails = '';
        const storeMailContents = {};
        storeMailContents.logo = logo;
        storeMailContents.emailContent = customerMessage;
        storeMailContents.redirectUrl = payload.storeRedirectUrl;
        storeMailContents.productDetailData = productDetailData;
        storeMailContents.today = today;
        storeMailContents.orderData = orderData;
        codCustomerMail.storeMailContents = storeMailContents;
        codCustomerMail.email = orderData.email;
        codCustomerMail.subject = emailContent.subject;
        codCustomerMail.bcc = false;
        codCustomerMail.isAttachment = false;
        codCustomerMail.attachmentDetails = '';
        const order = yield orderService.findOne({ where: { orderId: orderData.orderId } });
        order.paymentType = plugin ? plugin.pluginName : '';
        order.productDetail = yield orderProductService.find({ where: { orderId: orderData.orderId } }).then((val) => {
            const productImage = val.map((value) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
                let image;
                image = yield productImageService.findOne({ where: { productId: value.productId } });
                const temp = value;
                temp.image = image;
                return temp;
            }));
            return Promise.all(productImage);
        });
        return {
            status: 1,
            message: 'You have successfully placed order. order details sent to your mail',
            data: { order, email: { newCustomerMail, codAdminMail, codCustomerMail, codVendorMails, stockNotifyMails } },
        };
    }
    else if (plugin.pluginName === 'Wallet' && payload.pluginModule.includes('Wallet')) {
        // WALLET CHANGE 3: deduct using finalOrderTotal — backend-computed after coupon,
        // never from frontend payload.
        try {
            const walletHook = require(payload.dirName + '/../../../../add-ons/Wallet/walletOrderHook');
            // Re-validate with the real final total (coupon may have reduced it)
            const validation = yield walletHook.validateWalletPayment(payload.customerId, finalOrderTotal);
            if (!validation.valid) {
                return { status: 0, message: validation.message };
            }
            const result = yield walletHook.deductWalletForOrder(payload.customerId, orderData.orderId, finalOrderTotal);
            if (!result.success) {
                return { status: 0, message: result.message };
            }
        }
        catch (_e) {
            return { status: 0, message: 'Wallet deduction failed. Please try again.' };
        }
        // Mark order as paid instantly (same as COD)
        orderData.paymentFlag = 1;
        orderData.paymentStatus = 1;
        orderData.paymentProcess = 1;
        orderData.paymentType = 'Wallet';
        yield orderService.update(orderData.orderId, orderData);
        // Build email payload same as COD
        const emailContent = yield emailTemplateService.findOne({ where: { emailTemplateId: 5 } });
        const adminEmailContent = yield emailTemplateService.findOne({ where: { emailTemplateId: 6 } });
        const today = ('0' + nowDate.getDate()).slice(-2) + '.' + ('0' + (nowDate.getMonth() + 1)).slice(-2) + '.' + nowDate.getFullYear();
        const customerName = (orderData.shippingFirstname || '') + ' ' + (orderData.shippingLastname || '');
        const adminMessage = adminEmailContent.content.replace('{adminname}', 'Admin').replace('{name}', customerName).replace('{orderId}', orderData.orderId);
        const customerMessage = emailContent.content.replace('{name}', customerName);
        const adminId = [];
        const adminUser = yield userService.find({ select: ['username'], where: { userGroupId: 1, deleteFlag: 0 } });
        for (const user of adminUser) {
            adminId.push(user.username);
        }
        const codVendorMails = [];
        const vendorInvoice = yield vendorInvoiceService.find({ where: { orderId: orderData.orderId } });
        if (vendorInvoice.length > 0) {
            for (const vendInvoice of vendorInvoice) {
                const vendorProductDetailData = [];
                const vendor = yield vendorService.findOne({ where: { vendorId: vendInvoice.vendorId } });
                const customer = yield customerService.findOne({ where: { id: vendor.customerId } });
                const vendorMessage = adminEmailContent.content.replace('{adminname}', vendor.companyName).replace('{name}', customerName).replace('{orderId}', orderData.orderId);
                const vendorInvoiceItem = yield vendorInvoiceItemService.find({ where: { vendorInvoiceId: vendInvoice.vendorInvoiceId } });
                for (const vendInvoiceItem of vendorInvoiceItem) {
                    const vendorProductInformation = yield orderProductService.findOne({ where: { orderProductId: vendInvoiceItem.orderProductId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'basePrice', 'skuName', 'taxValue', 'taxType', 'orderProductPrefixId'] });
                    const vendorProductImageData = yield productService.findOne({ where: { productId: vendorProductInformation.productId } });
                    const vendorProductImageDetail = yield productImageService.findOne({ where: { productId: vendorProductInformation.productId, defaultImage: 1 } });
                    vendorProductImageData.productInformationData = vendorProductInformation;
                    vendorProductImageData.productImage = vendorProductImageDetail;
                    vendorProductDetailData.push(vendorProductImageData);
                }
                const vendorMailContents = {};
                vendorMailContents.logo = logo;
                vendorMailContents.emailContent = vendorMessage;
                vendorMailContents.redirectUrl = payload.vendorRedirectUrl;
                vendorMailContents.productDetailData = vendorProductDetailData;
                vendorMailContents.today = today;
                vendorMailContents.orderData = orderData;
                const codVendorMail = {};
                codVendorMail.vendorEmailContents = vendorMailContents;
                codVendorMail.vendorEmail = customer.email;
                codVendorMail.subject = adminEmailContent.subject;
                codVendorMail.bcc = false;
                codVendorMail.isAttachment = false;
                codVendorMail.attachmentDetails = '';
                codVendorMails.push(Object.assign({}, codVendorMail));
            }
        }
        const adminMailContents = {};
        adminMailContents.logo = logo;
        adminMailContents.emailContent = adminMessage;
        adminMailContents.redirectUrl = payload.adminRedirectUrl;
        adminMailContents.productDetailData = productDetailData;
        adminMailContents.today = today;
        adminMailContents.orderData = orderData;
        codAdminMail.adminMailContents = adminMailContents;
        codAdminMail.adminId = adminId;
        codAdminMail.subject = adminEmailContent.subject;
        codAdminMail.bcc = false;
        codAdminMail.isAttachment = false;
        codAdminMail.attachmentDetails = '';
        const storeMailContents = {};
        storeMailContents.logo = logo;
        storeMailContents.emailContent = customerMessage;
        storeMailContents.redirectUrl = payload.storeRedirectUrl;
        storeMailContents.productDetailData = productDetailData;
        storeMailContents.today = today;
        storeMailContents.orderData = orderData;
        codCustomerMail.storeMailContents = storeMailContents;
        codCustomerMail.email = orderData.email;
        codCustomerMail.subject = emailContent.subject;
        codCustomerMail.bcc = false;
        codCustomerMail.isAttachment = false;
        codCustomerMail.attachmentDetails = '';
        const order = yield orderService.findOne({ where: { orderId: orderData.orderId } });
        order.paymentType = 'Wallet';
        order.productDetail = yield orderProductService.find({ where: { orderId: orderData.orderId } }).then((val) => {
            const productImage = val.map((value) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
                const image = yield productImageService.findOne({ where: { productId: value.productId } });
                const temp = value;
                temp.image = image;
                return temp;
            }));
            return Promise.all(productImage);
        });
        return {
            status: 1,
            message: 'You have successfully placed order. order details sent to your mail',
            data: { order, email: { newCustomerMail, codAdminMail, codCustomerMail, codVendorMails, stockNotifyMails } },
        };
    }
    else {
        const pluginInfo = JSON.parse(plugin.pluginAdditionalInfo);
        orderData.paymentProcess = 0;
        yield orderService.update(orderData.orderId, orderData);
        let route = payload.baseUrl + pluginInfo.processRoute + '/' + orderData.orderPrefixId;
        if (plugin.pluginName === 'razorpay' && checkoutParam.isMobile) {
            route = payload.baseUrl + pluginInfo.processAPIRoute + '/' + orderData.orderPrefixId;
            return { status: 4, message: 'Redirect to this url', data: { route, email: { newCustomerMail, stockNotifyMails } } };
        }
        return { status: 3, message: 'Redirect to this url', data: { route, email: { newCustomerMail, stockNotifyMails } } };
    }
});
exports.orderCreate = orderCreate;
//# sourceMappingURL=order-controller.js.map