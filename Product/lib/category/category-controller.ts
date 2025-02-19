import { Connection } from "typeorm";
import { escapeChar, validate_category_slug } from "./service/category-service-utils";
import { categoryListByQueryBuilder } from "./service/category-service";
import moment from "moment";

export const categoryCreate = async (
    _connection: Connection,
    payload: {
        name: string,
        containerName: string,
        containerPath: string,
        parentInt: number,
        industryId: number,
        sortOrder: number,
        categorySlug: string,
        categoryDescription: string,
        status: number,
    }
): Promise<{
    status: number,
    message: string,
    data?: object,
}> => {

    const categoryService = _connection.getRepository('Category');
    const categoryPathService = _connection.getRepository('CategoryPath');

    const newCategory = {} as any;

    newCategory.name = payload.name;
    newCategory.image = payload.containerName;
    newCategory.imagePath = payload.containerPath;
    newCategory.parentInt = payload.parentInt;
    newCategory.sortOrder = payload.sortOrder;
    newCategory.industryId = payload.industryId;
    const metaTagTitle = payload.categorySlug ? payload.categorySlug : payload.name;
    const slug = metaTagTitle.trim();
    const data = slug.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
    newCategory.categorySlug = await validate_category_slug(_connection, data);
    newCategory.isActive = payload.status;
    newCategory.categoryDescription = payload.categoryDescription ? escapeChar(payload.categoryDescription) : '';
    newCategory.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    newCategory.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const categorySave: any = await categoryService.save(newCategory);

    const getAllPath: any = await categoryPathService.find({
        where: { categoryId: payload.parentInt },
        order: { level: 'ASC' },
    });

    let level = 0;
    for (const path of getAllPath) {
        const CategoryPathLoop = {} as any;
        CategoryPathLoop.categoryId = categorySave.categoryId;
        CategoryPathLoop.pathId = path.pathId;
        CategoryPathLoop.level = level;
        await categoryPathService.save(CategoryPathLoop);
        level++;
    }

    const newCategoryPath = {} as any;
    newCategoryPath.categoryId = categorySave.categoryId;
    newCategoryPath.pathId = categorySave.categoryId;
    newCategoryPath.level = level;
    await categoryPathService.save(newCategoryPath);

    return {
        status: 1,
        message: 'Successfully created New Category.',
        data: categorySave,
    };
}

export const categoryList = async (
    _connection: Connection,
    limit: number,
    offset: number,
    keyword: string,
    status: string,
    name: string,
    sortOrder: number,
    industryId: number,
) => {
    const select = [
        'CategoryPath.categoryId as categoryId',
        'category.sortOrder as sortOrder',
        'category.parentInt as parentInt',
        'category.name as name',
        'category.industryId as industryId',
        'category.image as image',
        'category.imagePath as imagePath',
        'category.isActive as isActive',
        'category.createdDate as createdDate',
        'category.categorySlug as categorySlug',
        'GROUP_CONCAT' + '(' + 'path.name' + ' ' + 'ORDER BY' + ' ' + 'CategoryPath.level' + ' ' + 'SEPARATOR' + " ' " + '>' + " ' " + ')' + ' ' + 'as' + ' ' + 'levels',
    ];

    const relations = [
        {
            tableName: 'CategoryPath.category',
            aliasName: 'category',
        },
        {
            tableName: 'CategoryPath.path',
            aliasName: 'path',
        },
    ];
    const groupBy = [
        {
            name: 'CategoryPath.category_id',
        },
    ];

    const whereConditions = [];
    if (status || status === '0') {
        whereConditions.push({
            name: 'category.isActive',
            op: 'or',
            value: +status,
        });
    }

    if (industryId) {
        whereConditions.push({
            name: 'category.industryId',
            op: 'and',
            value: industryId,
        });
    }

    const searchConditions = [];
    if (keyword && keyword !== '') {
        searchConditions.push({
            name: ['category.name'],
            value: keyword,
        });
    }

    if (name?.trim()) {
        searchConditions.push({
            name: ['category.name'],
            value: name,
        });
    }

    const sort = [];
    if (sortOrder) {
        sort.push({
            name: 'sortOrder',
            order: sortOrder === 2 ? 'DESC' : 'ASC',
        });
    } else {
        sort.push({
            name: 'createdDate',
            order: 'DESC',
        });
    }
    const vendorCategoryList = await categoryListByQueryBuilder(_connection, limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
    return {
        status: 1,
        message: 'Successfully got the vendor category list.',
        data: vendorCategoryList,
    };
}