# Spurtcommerce Marketplace 

The `@spurtcommerce/marketplace` provides essential functionality for vendor registration, profile retrieval, and managing vendor products. It is designed to be used in Node.js applications utilizing the TypeORM library for database interactions.

## Key Features:
**Vendor Management:**
    • Allows vendors to register by providing necessary details
    • Performs validation checks for duplicate display names and matching passwords
    • Interacts with the database to store vendor and customer information
    • Retrieves and returns the profile of a specific vendor
    • Fetches additional details such as customer information, country, and vendor categories
**Vendor Products Listing:**
    • Retrieves a list of products associated with a specific vendor
    • Supports filtering based on keywords, SKU, status, and price
    • Provides pagination for managing large product lists
    • Retrieves and includes associated categories for each product
    • Calculates earnings for each product based on order history

## Package Installation
With npm:
```bash
npm install @spurtcommerce/marketplace
```

## Implementation logic:
## 1. vendorRegister()
This function handles the registration of vendors. It takes vendor details, IP address, and redirection URLs as inputs, performs necessary validations, and registers the vendor in the database. It also sends confirmation emails to both the vendor and admin upon successful registration.
**Parameters:**
This function expects parameters such as,
    • **_connection:** TypeORM database connection.
    • **payload:**
>**body:** Vendor registration details.
**ip:** IP address of the user.
**vendorRedirectUrl:** URL for vendor redirection.
**adminRedirectUrl:** URL for admin redirection.

Returns a promise with a status, message, and optional data object.

**Usage Example:**

````ts
// Payload for Vendor Registration
const registrationPayload = {
  body: {
    // Vendor registration details
    displayName: "VendorDisplayName",
    // ... other registration details
  },
  ip: "192.168.1.1",
  vendorRedirectUrl: "https://vendor.example.com/redirect",
  adminRedirectUrl: "https://admin.example.com/redirect",
};

// Example of Vendor Registration Call
const registrationResult = await require('@spurtcommerce/marketplace').vendorRegister(connection, registrationPayload);
````

## 2. getVendorProfile()
This function retrieves and returns the profile of a vendor based on the provided vendor ID. It fetches details such as vendor information, customer details, country, and vendor categories associated with the vendor. 
**Parameters:**
    • TypeORM connection 
    • Payload having vendorId, the ID of the vendor whose details should be fetched
Returns a promise with an object containing status, message, and vendor profile data.

**Usage Example:**

````ts
// Payload for Getting Vendor Profile
const profilePayload = {
  vendorId: 123,
};

// Example of Getting Vendor Profile Call
const profileResult = await require('@spurtcommerce/marketplace').getVendorProfile(connection, profilePayload);
````

## 3. vendorProductList()
This function fetches a list of products associated with a specific vendor. The function allows for pagination, keyword-based searching, SKU filtering, status filtering, and price filtering. It returns a list of products with details such as name, SKU, price, and associated categories.
**Parameters:**
    • **_connection:** TypeORM database connection.
    • **limit:** Limit the number of products to retrieve.
    • **offset:** Offset for paginated results.
    • **keyword:** Keyword for product search.
    • **sku:** SKU for product filtering.
    • **status:** Product status (active/inactive).
    • **price:** Price filter for products.
    • **count:** Boolean indicating whether to return the product count.
    • **vendorId:** ID of the vendor.
Returns a promise with an object containing status, message, and product data specific to the vendor in request. 

**Usage Example:**
````ts
// Payload for Vendor Product List
const productListPayload = {
  limit: 10,
  offset: 0,
  keyword: "product_keyword",
  sku: "ABC123",
  status: "1",
  price: 50,
  count: false,
  vendorId: 123,
};

// Example of Vendor Product List Call
const productListResult = await require('@spurtcommerce/marketplace').vendorProductList(connection, productListPayload)
````

## Development
Fork/clone this repository and install dependencies normally:
````bash
git clone https://github.com/spurtcommerce/marketplace
cd marketplace
npm i
````
Then you can edit source files and test locally with `npm start serve`.

## Notes:
Ensure that you have valid TypeORM connections and proper configuration. The actual usage of this function would depend on how it's integrated into your application and how routes and permissions are defined in your system.