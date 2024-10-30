import { Connection } from "typeorm";
export declare const addSlashes: (str: string) => string;
export declare const checkSlug: (_connection: Connection, slug: string, id: number, count?: number) => Promise<number>;
export declare const validate_slug: (_connection: Connection, $slug: string, $id?: number, $count?: number) => any;
export declare const escapeChar: (data: string) => string;
