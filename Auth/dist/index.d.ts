import { Action } from 'routing-controllers';
import { DataSource } from 'typeorm';
export declare function authorizationChecker(connection: DataSource, jwtSecret: string, cryptoSecret: string, additionalInfo: any): (action: Action, roles: string[]) => Promise<boolean> | boolean;
