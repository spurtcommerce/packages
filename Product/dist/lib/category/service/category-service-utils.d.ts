import { Connection } from "typeorm";
export declare const validate_category_slug: (_connection: Connection, $slug: string, $id?: number, $count?: number) => Promise<string>;
export declare const escapeChar: (data: string) => string;
