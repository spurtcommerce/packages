"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryList = exports.categoryCreate = void 0;
const tslib_1 = require("tslib");
const category_service_utils_1 = require("./service/category-service-utils");
const category_service_1 = require("./service/category-service");
const moment_1 = tslib_1.__importDefault(require("moment"));
const categoryCreate = (_connection, payload) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const categoryService = _connection.getRepository('Category');
    const categoryPathService = _connection.getRepository('CategoryPath');
    const newCategory = {};
    newCategory.name = payload.name;
    newCategory.image = payload.containerName;
    newCategory.imagePath = payload.containerPath;
    newCategory.parentInt = payload.parentInt;
    newCategory.sortOrder = payload.sortOrder;
    newCategory.industryId = payload.industryId;
    const metaTagTitle = payload.categorySlug ? payload.categorySlug : payload.name;
    const slug = metaTagTitle.trim();
    const data = slug.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
    newCategory.categorySlug = yield (0, category_service_utils_1.validate_category_slug)(_connection, data);
    newCategory.isActive = payload.status;
    newCategory.categoryDescription = payload.categoryDescription ? (0, category_service_utils_1.escapeChar)(payload.categoryDescription) : '';
    newCategory.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    newCategory.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    const categorySave = yield categoryService.save(newCategory);
    const getAllPath = yield categoryPathService.find({
        where: { categoryId: payload.parentInt },
        order: { level: 'ASC' },
    });
    let level = 0;
    for (const path of getAllPath) {
        const CategoryPathLoop = {};
        CategoryPathLoop.categoryId = categorySave.categoryId;
        CategoryPathLoop.pathId = path.pathId;
        CategoryPathLoop.level = level;
        yield categoryPathService.save(CategoryPathLoop);
        level++;
    }
    const newCategoryPath = {};
    newCategoryPath.categoryId = categorySave.categoryId;
    newCategoryPath.pathId = categorySave.categoryId;
    newCategoryPath.level = level;
    yield categoryPathService.save(newCategoryPath);
    return {
        status: 1,
        message: 'Successfully created New Category.',
        data: categorySave,
    };
});
exports.categoryCreate = categoryCreate;
const categoryList = (_connection, limit, offset, keyword, status, name, sortOrder, industryId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
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
    if (name === null || name === void 0 ? void 0 : name.trim()) {
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
    }
    else {
        sort.push({
            name: 'createdDate',
            order: 'DESC',
        });
    }
    const vendorCategoryList = yield (0, category_service_1.categoryListByQueryBuilder)(_connection, limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
    return {
        status: 1,
        message: 'Successfully got the vendor category list.',
        data: vendorCategoryList,
    };
});
exports.categoryList = categoryList;
//# sourceMappingURL=category-controller.js.map