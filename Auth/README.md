# Spurtcommerce Auth

The @spurtcommerce/auth npm package serves as a robust authorization middleware designed for use with the "routing-controllers" library in Node.js applications. This middleware leverages TypeORM for database interactions, JWT for secure authentication, and CryptoJS for cryptographic operations that helps controlling access to your routes based on user roles, tokens, and permissions.

## Key Features:

### User Roles and Permissions:

 * Validates users based on their roles, such as customers, vendors, and administrators
 * Grants access based on user roles and permissions (action.request.user)

#### Token Security: 
   * Parses and decrypts JWT tokens (Json Web Tokens) from the HTTP request's 'authorization' header
   * Verifies the validity of tokens using the provided jwtSecret
   * Checks if the token has been revoked by checking the database

#### Database Integration: 

   *   Validates users against different entities in the database, including 'Customer', 'Vendor', 'User', and 'UserGroup'
   *  Ensures users meet specific criteria such as being active and not flagged for deletion

#### Easy Implementation: 
    * Simply integrate the authorizationChecker function into your routing-controllers setup.
    * Customize access rules to fit your application's specific needs.

## Package Installation

With npm:

```bash
npm install @spurtcommerce/auth
```

**Implementation logic:**
The authorizationChecker function takes three parameters:
**Function Signature:**
    • connection: A TypeORM connection object.
    • jwtSecret: A secret key used for JWT operations.
    • cryptoSecret: A secret key used for cryptographic operations.
**Inner Authorization Checker Function:**
    • Parses the authorization header from the HTTP request to extract the JWT token
    • Decrypts the JWT token using CryptoJS and verifies it using the provided jwtSecret
    • Checks if the token exists in the database to see if it has been revoked.
    • Validates the user based on their ID and role
    • Depending on the specified roles, it validates the user against different entities (Customer, Vendor, User) in the database
    • It checks if the user has the required role and sets action.request.user accordingly
    • For roles other than 'customer', 'vendor', and 'admin-vendor', the function performs additional permission checks based on the user's group and the requested route
    • It retrieves and parses permissions from the user or user group and checks if the user has the necessary permissions for the requested route
**Return Values:**
The function returns true if the user is authorized, false otherwise.

### Usage Example

```ts
const authService = require('@spurtcommerce/auth').authorizationChecker;
const expressApp: Application = useExpressServer(app, {
    /**
     * We can add options about how routing-controllers should configure itself.
     * Here we specify what controllers should be registered in our express server.
     */
        controllers: Object.values(controllers),
        middlewares: Object.values(middlewares),
        cors: true,
        /**
            * Authorization features
        */
        authorizationChecker: authService(connection, env.jwtSecret, env.cryptoSecret),
});
```

## Development
Fork/clone this repository and install dependencies normally:
````bash
git clone https://github.com/spurtcommerce/auth
cd auth
npm i
````
Then you can edit source files and test locally with `npm start serve`.

## Notes:
Ensure that you have valid TypeORM connections and proper configuration for JWT and CryptoJS secrets.
Customize the role-based logic and entity validations according to your application's requirements.
The actual usage of this function would depend on how it's integrated into your application and how routes and permissions are defined in your system.