# Spurtcommerce Cart

The @spurtcommerce/cart package is designed to streamline cart-related operations in Node.js applications. It offers features like creating and updating carts, retrieving cart lists, and removing items from the cart. With a focus on simplicity and efficiency, this npm package simplifies the implementation of shopping cart functionalities for developers.

#### Key Features:

* Cart Creation: Seamlessly create and manage shopping carts in your Node.js application    Flexible Cart Updates:** Effortlessly update cart items, quantities, and prices to accommodate various scenarios
* Intuitive Cart Deletion:  Easily remove items from the cart, ensuring a smooth user experience
 * Detailed Cart Listing:** Retrieve comprehensive lists of cart items with essential product details and pricing information
 * IP Address Tracking:** Enhance security and analytics by keeping track of user IP addresses
* Product Option Support:** Handle products with multiple options, such as variations, with ease
* Stock Management:** Implement stock-related checks to enforce quantity limits and prevent out-of-stock issues
* Extensive Product Information:** Retrieve detailed product information, including images, descriptions, and stock status
* Dynamic Pricing:** Leverage dynamic pricing features, including discounts and special offers, for an enhanced shopping experience

## Package Installation
With npm:
```bash
npm install @spurtcommerce/cart
```

## Implementation logic:

## 1. cartCreate()
Creates or updates a cart item based on the provided payload.
**Parameters:**
This function expects parameters such as (1) typeorm Connection object, representing the database connection and (2) payload object that contains following:
    • **productId** (Type: number): The ID of the product to be added to the cart.
    • **skuName** (Type: string): The SKU (Stock Keeping Unit) name of the product.
    • **customerId** (Type: number): The ID of the customer associated with the cart.
    • **quantity** (Type: number): The quantity of the product to be added or updated in the cart.
    • **type** (Type: string): The type of cart operation, indicating whether it's a new addition or an update.
    • **productPrice** (Type: number): The price of the product.
    • **tirePrice** (Type: number): The tire (tier) price of the product.
    • **ipAddress** (Type: string): The IP address associated with the cart operation.
Returns a promise with a status, message, and optional data object.

**Usage Example**
```ts
const { Connection } = require("typeorm");
const { cartCreate } = require('@spurtcommerce/cart');

const connection = new Connection();
const payload = {
    productId: 123,
    skuName: "ABC123",
    customerId: 456,
    quantity: 2,
    type: "new",
    productPrice: 29.99,
    tirePrice: 5.99,
    ipAddress: "192.168.0.1",
};

cartCreate(connection, payload)
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

## 2. cartDelete() 
This function removes specific items from the cart or clears the entire cart for a customer. 
Parameters:
TypeORM connection and a payload (payload) containing following:
    • **customerId** (Type: number): The ID of the customer whose cart items are to be deleted.
    • **productIds** (Type: number[], optional): An array of product IDs to be removed from the cart. If not provided, it clears the entire cart.
Returns a promise with a status, message, and optional data object.

**Usage Example:**
````ts
const { Connection } = require("typeorm");
const { cartDelete } = require('@spurtcommerce/cart');

const connection = new Connection();
const payload = {
    customerId: 456,
    productIds: [123, 456, 789],
};

cartDelete(connection, payload)
    .then(response => console.log(response))
    .catch(error => console.error(error));
````

## 3. cartList()
This function retrieves the list of items in the cart for a specified customer.
Parameters:
    • **_connection** (Type: Connection): An instance of the typeorm Connection class, representing the database connection.
    • **customerId** (Type: number): The ID of the customer for whom the cart items are to be retrieved.
    • **limit** (Type: number): The maximum number of cart items to retrieve in a single request.
    • **offset** (Type: number): The offset for pagination, indicating the starting point for retrieving cart items.
    • **count** (Type: number): A flag indicating whether to retrieve only the count of cart items (useful for pagination).
Returns a promise with a status, message, and list of cart items specific to a customer.

**Usage Example:**

````ts
const { Connection } = require("typeorm");
const { cartList } = require('@spurtcommerce/cart');

const connection = new Connection();
const customerId = 456;
const limit = 10;
const offset = 0;
const count = true;

cartList(connection, customerId, limit, offset, count)
    .then(response => console.log(response))
    .catch(error => console.error(error));
````

## Development
Fork/clone this repository and install dependencies normally:
````bash
git clone https://github.com/spurtcommerce/cart
cd cart
npm i
````
Then you can edit source files and test locally with `npm start serve`.

## Notes:
Ensure that you have valid TypeORM connections. The actual usage of this function would depend on how it's integrated into your application and how routes and permissions are defined in your system.