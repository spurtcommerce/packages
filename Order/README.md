# Spurtcommerce Order

The @spurtcommerce/order is an npm package designed for handling order creation and management within a TypeScript application, particularly suited for e-commerce platforms. It provides functionalities for creating orders, validating coupons, processing payments, and managing stock.

## Key Features:
• **Order Creation:** Efficiently handles the creation of orders with detailed customer and product information.
    • **Coupon Validation:** Validates and applies coupons to orders, ensuring accuracy and adherence to coupon rules.
    • **Dynamic Pricing:** Calculates dynamic pricing for products, considering tax, special prices, discounts, and tire prices.
    • **Stock Management:** Manages product stock, including quantity checks, stock alerts, and updates after order creation.
    • **Plugin Integration:** Integrates with plugins, allowing extensibility for features like payment methods and discounts.
    • **Vendor Support:** Supports orders with multiple vendors, including commission calculations and order logs for vendors.
    • **Customer Account Handling:** Manages customer accounts, including new customer creation, login validation, and account-related validations.
    • **Email Notifications:** Sends email notifications to customers and administrators upon successful order placement, providing order details.
    • **Payment Method Processing:** Processes payments through different payment methods, handling redirections and responses accordingly.
    • **Configurable Settings:** Allows configuration of settings such as order status, invoice prefixes, and currency information.

## Package Installation
With npm:
```bash
npm install @spurtcommerce/order
```

## Implementation logic:
### orderCreate()
The orderCreate function is typically invoked when a user completes the checkout process in an e-commerce application. It orchestrates various tasks related to order creation, integrates with plugins, and ensures data consistency in the database. The function is designed to handle different scenarios, including successful order placement, coupon validation, and stock management.
**Parameters:**
This function expects parameters such as,
    • **_connection** (TypeORM Connection):  The TypeORM connection object used for database operations.
    • **payload** (Object): An object containing various parameters needed for order creation:
>**◦ checkoutPayload:** Information related to the checkout process, including product details, coupon data, and other relevant information.
        **◦ pluginModule:** An array of strings representing the active plugin modules for the order.
        ◦ **ipAddress:** The IP address of the client placing the order.
        ◦ **customerId:** The ID of the customer placing the order.
        ◦ **storeRedirectUrl:** The redirect URL for the store after a successful order.
        ◦ **adminRedirectUrl:** The redirect URL for the admin interface after a successful order.
        ◦ **baseUrl:** The base URL of the application.
        ◦ **dirName:** The directory name of the application. 

**Return value:**
The function returns ,
    • **status:** An integer representing the status of the order creation process (e.g., 0 for failure, 1 for success).
    • **message:** A string providing a message related to the outcome of the order creation.
    • **data:** An optional field containing additional data, such as order details, in case of a successful order creation.
    
**Usage Example:**
````ts
import { Connection } from "typeorm";
import { orderCreate } from '@spurtcommerce/order;

// Example Usage
const connection: Connection = /* Your TypeORM connection */;
const payload = {
  checkoutPayload: /* Your order checkout payload */,
  pluginModule: /* Array of active plugins */,
  ipAddress: /* User's IP address */,
  customerId: /* Customer ID */,
  storeRedirectUrl: /* Redirect URL for the store */,
  adminRedirectUrl: /* Redirect URL for the admin */,
  baseUrl: /* Base URL of the application */,
  dirName: /* Directory name */,
};

orderCreate(connection, payload)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
````

## Development
Fork/clone this repository and install dependencies normally:
````bash
git clone https://github.com/spurtcommerce/order
cd order
npm i
````
Then you can edit source files and test locally with `npm start serve`.

## Notes:
Ensure that you have valid TypeORM connections and proper configuration. The actual usage of this function would depend on how it's integrated into your application and how routes and permissions are defined in your system.