# Spurtcommerce Customer

Managing customer interactions is a fundamental aspect of many applications. The `@spurtcommerce/customer` npm package signifies this process by offering simple and efficient functions for customer registration, customer list retrieval, and customer profile fetching. 
Built on top of TypeORM, it ensures smooth interactions with your database, making customer-related tasks a manageable one.

## Key Features:
**Secure Registration:**
Utilize the customerRegister function to securely register new customers. Passwords are hashed, and registration details are validated.
**Flexible List Retrieval:**
Retrieve lists of customers based on various criteria using the versatile getCustomerList function. Filter by name, email, date, and more.
**Individual Profile Fetching:**
Effortlessly obtain detailed profiles for specific customers with the getCustomerProfile function.

## Package Installation
With npm:
```bash
npm install @spurtcommerce/customer
```

## Implementation logic:

## 1. customerRegister()
The customerRegister  function handles the registration process for new customers securely. Validates and hashes passwords, checks for existing accounts, and sends confirmation emails. 
This function expects a TypeORM connection and a payload containing customer registration data, IP address, and redirect URL. It returns a promise that resolves to an object containing status information, a descriptive message, and additional data related to the registration process, if any.

**Usage Example**
```ts
public async register(@Body({ validate: true }) registerParam: CustomerRegisterRequest, @Req() request: any, @Res() response: any): Promise<any> {
        const customerSave = await customerRegister(getConnection(), {
            body: registerParam,
            ip: (request.headers['x-forwarded-for'] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress).split(',')[0]
        });
        if (customerSave.status === 0) {
            return response.status(400).send({
                status: customerSave.status,
                message: customerSave.message,
            });
        }
}
```
## 2. getCustomerList()
The getCustomerList function fetches a list of customer records from the database based on various criteria, including column selection, filtering by name, email, status, and more. The function also supports pagination and can return either the actual data or just the count of matching records. 
**Parameters:**
TypeORM connection and a payload (payload) containing customer registration data, IP address, and redirect URL. 
Payload:
    • **select[]** - An array representing the columns or fields that should be selected when querying the database for customer data. For example, ['id', 'firstName', 'email']
    • **limit** - A number parameter that specifies the maximum number of records to retrieve from the database. It helps control the size of the result set
    • **offset** - A number parameter that specifies the number of records to skip before starting to return records. It is often used in conjunction with limit for paginating through a large set of results
    • **name** - A string parameter that allows filtering the customer list based on the customer's name. If provided, only customers with names matching this string will be included in the result
    • **status** - A numeric parameter is used to filter the customer list based on a Active / Inactive status codes
    • **email** - A string parameter that allows filtering customers based on their email addresses
    • **customerGroup**  - A string parameter that allows filtering customer list on a specific customer group that they belong to
    • **date** - A date parameter that specifies the filtering based on when was the customer record actually created in the application
    • **count** - A numeric parameter  indicates whether the function should return only the count of matching records without fetching the actual data
**Returns:**
An array of customer records or just the count of matching records, depending on the count parameter.

**Usage Example:**
````ts
public async customerList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('name') name: string, @QueryParam('status') status: string, @QueryParam('email') email: string, @QueryParam('customerGroup') customerGroup: string, @QueryParam('date') date: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = [
            'Customer.id as id',
            'Customer.firstName as firstName',
            'Customer.email as email',
            'Customer.createdDate as createdDate',
            'Customer.isActive as isActive',
            'Customer.username as username',
            'customerGroup.name as customerGroupName',
            'Customer.lastName as lastName',
        ];
        const customerList = await getCustomerList(getConnection(), select, limit, offset, name, status ? 1 : 0, email, customerGroup, date, count ? 1 : 0);
        return response.status(200).send({
            status: customerList.status,
            message: customerList.message,
            data: customerList.data,
        });
````

## 3. getCustomerProfile()
This function retrieves the detailed profile of a specific customer based on their ID. It takes a TypeORM connection and the unique ID of the customer as parameters and returns a promise that resolves to an object containing the status, a descriptive message, and the customer profile data.

**Usage Example:**
````ts
public async getProfile(@Req() request: any, @Res() response: any): Promise<any> {
        const customerDetails = await getCustomerProfile(getConnection(), request.user.id);
        return response.status(200).send(
            {
                status: customerDetails.status,
                message: customerDetails.message,
                data: customerDetails.data,
            }
        );
}
````

## Development
Fork/clone this repository and install dependencies normally:
````bash
git clone https://github.com/spurtcommerce/customer
cd customer
npm i
````
Then you can edit source files and test locally with `npm start serve`.

## Notes:
Ensure that you have valid TypeORM connections and proper configuration. The actual usage of this function would depend on how it's integrated into your application and how routes and permissions are defined in your system.