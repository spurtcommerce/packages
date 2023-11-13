import { Action } from 'routing-controllers';
import { Connection } from 'typeorm';
export declare function authorizationChecker(connection: Connection, jwtSecret: string, cryptoSecret: string): (action: Action, roles: string[]) => Promise<boolean> | boolean;
