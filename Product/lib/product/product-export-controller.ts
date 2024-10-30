import { Connection, In } from "typeorm";

export const excelExportProduct = async (_connection: Connection, productIds?: number[]): Promise<string> => {

    const productService = await _connection.getRepository('Product');

    const excel = require('exceljs');
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Product Detail Sheet');
    const rows = [];

    const condition = {} as any;

    if (productIds?.length) {

        condition.where = {
            productId: In(productIds),
        };

    }

    const productList: any = await productService.find(condition);

    rows.push(...productList.map((product) => {
        const dataDescription = product.description?.replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '') ?? '';
        return [product.productId, product.name, dataDescription, product.price, product.sku, product.upc, product.quantity, product.minimumQuantity, product.subtractStock]
    }));

    // for (const id of productid) {
    //     const dataId = await productService.findOne(id);
    //     const productDescription = dataId.description;
    //     const dataDescription = productDescription.replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '');
    //     rows.push([dataId.productId, dataId.name, dataDescription.trim(), dataId.price, dataId.sku, dataId.upc, dataId.quantity, dataId.minimumQuantity, dataId.subtractStock]);
    // }

    // const productid = productId.split(',');
    // for (const id of productid) {
    //     const dataId = await productService.findOne(id);
    //     if (dataId === undefined) {
    //         const errorResponse: any = {
    //             status: 0,
    //             message: 'Invalid productId',
    //         };
    //         return response.status(400).send(errorResponse);
    //     }
    // }

    // Excel sheet column define
    worksheet.columns = [
        { header: 'Product Id', key: 'productId', size: 16, width: 15 },
        { header: 'Product Name', key: 'name', size: 16, width: 15 },
        { header: 'Description', key: 'description', size: 16, width: 30 },
        { header: 'Price', key: 'price', size: 16, width: 15 },
        { header: 'SKU', key: 'sku', size: 16, width: 15 },
        { header: 'UPC', key: 'upc', size: 16, width: 15 },
        { header: 'Quantity', key: 'quantity', size: 16, width: 15 },
        { header: 'Minimum Quantity', key: 'minimumQuantity', size: 16, width: 19 },
        { header: 'Subtract Stock', key: 'subtractstock', size: 16, width: 15 },
        { header: 'Manufacture Id', key: 'manufactureId', size: 16, width: 15 },
    ];
    worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('H1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('I1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('J1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('K1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Add all rows data in sheet
    worksheet.addRows(rows);
    const fileName = '/ProductExcel_' + Date.now() + '.xlsx';
    const workingDir: string = process.cwd() + fileName;
    await workbook.xlsx.writeFile(workingDir);
    return workingDir;
}