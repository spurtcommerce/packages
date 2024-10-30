"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeChar = exports.validate_category_slug = void 0;
const tslib_1 = require("tslib");
const validate_category_slug = (_connection, $slug, $id = 0, $count = 0) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const checkSlug = (slug, id, count = 0) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (count > 0) {
            slug = slug + count;
        }
        const checkSlugData = (slug, id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const query = yield _connection.manager.createQueryBuilder('Category', 'category');
            query.where('category.category_slug = :slug', { slug });
            if (id > 0) {
                query.andWhere('category.categoryId != :id', { id });
            }
            return query.getCount();
        });
        return yield checkSlugData(slug, id);
    });
    const slugCount = yield checkSlug($slug, $id, $count);
    if (slugCount) {
        if (!$count) {
            $count = 1;
        }
        else {
            $count++;
        }
        return yield (0, exports.validate_category_slug)(_connection, $slug, $id, $count);
    }
    else {
        if ($count > 0) {
            $slug = $slug + $count;
        }
        return $slug;
    }
});
exports.validate_category_slug = validate_category_slug;
const escapeChar = (data) => {
    const val = data
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/,/g, '&sbquo;')
        .replace(/=/g, '&#61;')
        .replace(/-/g, '&#45;')
        .replace(/…/g, '&hellip;')
        .replace(/@/g, '&commat;')
        .replace(/©/g, '&copy;')
        .replace(/#/g, '&#35;')
        .replace(/“/g, '&ldquo;')
        .replace(/’/g, '&rsquo;')
        .replace(/‘/g, '&lsquo;')
        .replace(/™/g, '&trade;')
        .replace(/®/g, '&reg;')
        .replace(/–/g, '&ndash;')
        .replace(/é/g, '&eacute;')
        .replace(/€/g, '&euro;')
        .replace(/£/g, '&pound;');
    return val;
};
exports.escapeChar = escapeChar;
//# sourceMappingURL=category-service-utils.js.map