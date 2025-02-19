"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeChar = exports.validate_slug = exports.checkSlug = exports.addSlashes = void 0;
const tslib_1 = require("tslib");
const addSlashes = (str) => {
    return (str + '').replace(/'/g, "''");
};
exports.addSlashes = addSlashes;
const checkSlug = (_connection_1, slug_1, id_1, ...args_1) => tslib_1.__awaiter(void 0, [_connection_1, slug_1, id_1, ...args_1], void 0, function* (_connection, slug, id, count = 0) {
    if (count > 0) {
        slug = slug + count;
    }
    const checkSlugData = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const query = yield _connection.manager.createQueryBuilder('Product', 'product');
        query.where('product.product_slug = :slug', { slug });
        if (id > 0) {
            query.andWhere('product.productId != :id', { id });
        }
        return query.getCount();
    });
    return yield checkSlugData();
});
exports.checkSlug = checkSlug;
const validate_slug = (_connection_1, $slug_1, ...args_1) => tslib_1.__awaiter(void 0, [_connection_1, $slug_1, ...args_1], void 0, function* (_connection, $slug, $id = 0, $count = 0) {
    const checkSlug = (slug_1, id_1, ...args_2) => tslib_1.__awaiter(void 0, [slug_1, id_1, ...args_2], void 0, function* (slug, id, count = 0) {
        if (count > 0) {
            slug = slug + count;
        }
        const checkSlugData = (slug, id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const query = yield _connection.manager.createQueryBuilder('Product', 'product');
            query.where('product.product_slug = :slug', { slug });
            if (id > 0) {
                query.andWhere('product.productId != :id', { id });
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
        return yield (0, exports.validate_slug)(_connection, $slug, $id, $count);
    }
    else {
        if ($count > 0) {
            $slug = $slug + $count;
        }
        return $slug;
    }
});
exports.validate_slug = validate_slug;
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
//# sourceMappingURL=product-service-utils.js.map