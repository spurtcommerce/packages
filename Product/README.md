# Spurtcommerce Product

The `@spurtcommerce/product` package provides a versatile set of functions for handling various operations in a Node.js application. It streamlines product-related tasks, simplifies category management, and offers robust functionalities for tax management. Developers can leverage this toolkit to create products, retrieve product lists, manage categories with advanced filtering, create new categories, handle taxes seamlessly, and more.

## Key Features:
1. Product Operations
    • Easily create new products with the provided payload
    • Retrieve a list of products with flexible filtering options
2. Category Management
    • Streamline the process of creating new categories
    • Retrieve a list of categories with advanced filtering options
3. Tax Management
    • Effortlessly create new taxes with specified details
    • Retrieve a list of taxes, update tax information, and delete taxes as needed

## Package Installation
With npm:
```bash
npm install @spurtcommerce/product
```

## Implementation logic:

### 1. productCreate()
This function creates a new product based on the provided payload.
**Parameters:**
    • **payload:** An object containing product creation information such as productName, productDescription, productSlug, sku, upc, hsn, quantity, categoryId, tax, price,Image
    • TypeORM connection to the database
Returns a new product is created when a promise with a status, message, and optional data object.

**Usage Example:**
````ts
const { productCreate } = require('@spurtcommerce/product');
// ... initialize TypeORM connection

const payload = {
  // ... product creation payload
};

const result = await productCreate(payload, _connection);
console.log(result);
````

### 2. productList()
This function retrieves a list of products based on the provided criteria.
**Parameters:**
    • **_connection:** TypeORM connection to the database
    • **select:** An array of selected fields
    • **limit:** Number of items to retrieve
    • **offset:** Number of items to skip
    • **keyword:** Search keyword
    • **sku:** Product SKU
    • **status:** Product status (e.g., 'active', 'inactive')
    • **price:** Sorting option for the price (1 for ascending, 2 for descending)
    • **count:** Boolean indicating whether to retrieve the count only
**Returns** a promise with a status, message, and data object containing the product list.

**Usage Example:**
````ts
const { productList } = require('@spurtcommerce/product');
// ... initialize TypeORM connection

const select = ['productName', 'productPrice', 'quantity', 'isActive'];
const limit = 10;
const offset = 0;
const keyword = 'search-keyword';
const sku = 'product-sku';
const status = 'active';
const price = 1; // 1 for ascending, 2 for descending
const count = false;

const result = await productList(_connection, select, limit, offset, keyword, sku, status, price, count);
console.log(result);
````

### 3. categoryCreate()
This function creates a new category based on the provided payload.
**Parameters:**
    • **payload:** An object containing category creation information such as name, containerName, containerPath, parentInt, sortOrder, categorySlug, categoryDescription, status
    • **_connection:** TypeORM connection to the database
**Returns** a promise with a status, message, and optional data object.

**Usage Examaple:**
````ts
const { categoryCreate } = require('@spurtcommerce/product');
// ... initialize TypeORM connection

const payload = {
  name: 'New Category',
  containerName: 'category-image.jpg',
  containerPath: '/images/categories/',
  parentInt: 0, // Parent category ID, use 0 for top-level
  sortOrder: 1,
  categorySlug: 'new-category',
  categoryDescription: 'Description for the new category',
  status: 1, // 1 for active, 0 for inactive
};

const result = await categoryCreate(_connection, payload);
console.log(result);
````

### 4. categoryList()
This function retrieves a list of categories based on the provided criteria.
**Parameters:**
    • **_connection:** TypeORM connection to the database
    • **limit:** Number of items to retrieve
    • **offset:** Number of items to skip
    • **keyword:** Search keyword
    • **status:** Category status ('1' for active, '0' for inactive)
    • **sortOrder:** Sorting option for the list (1 for ascending, 2 for descending)
**Returns** a promise with a status, message, and data object containing the category list.

**Usage Example:**
````ts
const { categoryList } = require('@spurtcommerce/product');
// ... initialize TypeORM connection

const limit = 10;
const offset = 0;
const keyword = 'search-keyword';
const status = '1'; // '1' for active, '0' for inactive
const sortOrder = 1; // 1 for ascending, 2 for descending

const result = await categoryList(_connection, limit, offset, keyword, status, sortOrder);
console.log(result);
````

### 5. taxCreate()
This function creates a new tax based on the provided payload.
**Parameters:**
    • **payload:** An object containing tax creation information such as taxName, taxPercentage, taxStatus
    • **_connection:** TypeORM connection to the database
**Returns** a promise with a status, message, and optional data object.

**Usage Example:**
````ts
const { taxCreate } = require('@spurtcommerce/product');
// ... initialize TypeORM connection

const payload = {
  taxName: 'VAT',
  taxPercentage: 10,
  taxStatus: 1, // 1 for active, 0 for inactive
};
const result = await taxCreate(_connection, payload);
console.log(result);
````
### 6. taxList()
This function retrieves a list of Taxes on the provided criteria.
**Parameters:**
    • **_connection:** TypeORM connection to the database
    • **limit:** Number of items to retrieve
    • **offset:** Number of items to skip
    • **keyword:** Search keyword
    • **status:** Tax status ('1' for active, '0' for inactive)
    • **count:** If true, returns the count of taxes without the actual list
**Returns** a promise with a status, message, and data object containing the tax list.

**Usage Example:**
````ts
const { taxList } = require('@spurtcommerce/product');
// ... initialize TypeORM connection

const limit = 10;
const offset = 0;
const keyword = 'search-keyword';
const status = '1'; // '1' for active, '0' for inactive
const count = false; // true if you want to get the count only

const result = await taxList(_connection, limit, offset, keyword, status, count);
console.log(result);
````

### 7. taxDelete()
This function deletes a tax based on the provided tax ID.
**Parameters:**
    • **_connection:** TypeORM connection to the database
    • **taxId:** ID of the tax to delete
**Returns** a promise with a status and message.

**Usage Example:**
````ts
const { taxDelete } = require('@spurtcommerce/product');
// ... initialize TypeORM connection

const taxIdToDelete = 1; // replace with the actual tax ID

const result = await taxDelete(_connection, taxIdToDelete);
console.log(result);
````

### 8. taxUpdate()
This function upadates a tax based on the provided tax ID.

**Parameters:**
    • **payload:** An object containing tax update information
    • **_connection:** TypeORM connection to the database
**Returns** a promise with a status, message, and optional data object.

**Usage Example:**
````ts
const { taxUpdate } = require('@spurtcommerce/product');
// ... initialize TypeORM connection

const payload = {
  taxId: 1, // replace with the actual tax ID
  taxName: 'Updated VAT',
  taxPercentage: 12,
  taxStatus: 1, // 1 for active, 0 for inactive
};

const result = await taxUpdate(_connection, payload);
console.log(result);
````

## Development
Fork/clone this repository and install dependencies normally:
````bash
git clone https://github.com/spurtcommerce/product
cd product
npm i
````
Then you can edit source files and test locally with `npm start serve`.

## Notes:
Ensure that you have valid TypeORM connections and proper configuration. The actual usage of this function would depend on how it's integrated into your application and how routes and permissions are defined in your system.