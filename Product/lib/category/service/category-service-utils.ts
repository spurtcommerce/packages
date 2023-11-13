import { Connection } from "typeorm";

export const validate_category_slug = async (_connection: Connection, $slug: string, $id: number = 0, $count: number = 0): Promise<string> => {

    const checkSlug = async (slug: string, id: number, count: number = 0): Promise<number> => {
        if (count > 0) {
            slug = slug + count;
        }
        const checkSlugData = async (slug: string, id: number): Promise<number> => {
            const query = await _connection.manager.createQueryBuilder('Category', 'category');
            query.where('category.category_slug = :slug', { slug });
            if (id > 0) {
                query.andWhere('category.categoryId != :id', { id });
            }
            return query.getCount();
        }

        return await checkSlugData(slug, id);
    }

    const slugCount = await checkSlug($slug, $id, $count);

    if (slugCount) {
        if (!$count) {
            $count = 1;
        } else {
            $count++;
        }
        return await validate_category_slug(_connection, $slug, $id, $count);

    } else {
        if ($count > 0) {
            $slug = $slug + $count;
        }
        return $slug;
    }
}

export const escapeChar = (data: string): string => {
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
}