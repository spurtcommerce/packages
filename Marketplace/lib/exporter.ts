import { vendorRegister, getVendorProfile } from './vendor/vendor-controller';
import { vendorProductList } from './vendor/vendor-product-controller';

const marketplace = {
    vendorRegister,
    getVendorProfile,
    vendorProductList
};

export default marketplace;
