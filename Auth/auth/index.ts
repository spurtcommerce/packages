/*
 * Spurtcommerce Auth Npm
 * version 1.0.9
 * Copyrights © 2023, Spurtcommerce Esolutions Private Limited
 * Author Spurtcommerce Esolutions Pvt Ltd <support@spurtcommerce.com>
 * Licensed under the MIT license.
 */

import { Action } from 'routing-controllers';
import { Connection } from 'typeorm';
import jwt from 'jsonwebtoken';

export function authorizationChecker(connection: Connection, jwtSecret: string, cryptoSecret: string, additionalInfo: any): (action: Action, roles: string[]) => Promise<boolean> | boolean {

    return async function innerAuthorizationChecker(action: Action, roles: any): Promise<boolean> {

        const request = action.request;

        const parseBasicAuthFromRequest = async (req: { header: (arg0: string) => any; }, jwtSecret: string, cryptoSecret: string) => {
            const authorization = req.header('authorization');
            if (authorization && authorization.split(' ')[0] === 'Bearer') {
                if (!authorization) {
                    return undefined;
                }
                const UserId = await decryptToken(authorization.split(' ')[1]);
                console.log(JSON.stringify(UserId) + 'UserId:');
                return UserId;
            }
            return undefined;
        }

        const decryptToken = (encryptString: string) => {
            const Crypto = require('crypto-js');
            const bytes = Crypto.AES.decrypt(encryptString, cryptoSecret);
            const originalEncryptedString = bytes.toString(Crypto.enc.Utf8);
            return new Promise<any>((subresolve, subreject) => {
                jwt.verify(originalEncryptedString, jwtSecret, (err: any, decoded: any) => {
                    if (err) {
                        return subresolve(undefined);
                    }
                    return subresolve({ id: decoded.id, role: decoded.role, userType: decoded.userType });
                });
            });
        }

        // const userId = await parseBasicAuthFromRequest(action.request, jwtSecret, cryptoSecret);
        const userId = await parseBasicAuthFromRequest(request, jwtSecret, cryptoSecret);
        if (userId === undefined) {
            return false;
        }

        const checkTokenExist = async (req: { header: (arg0: string) => any; }, cryptoSecret: string) => {
            const authorization = req.header('authorization');
            if (authorization && authorization.split(' ')[0] === 'Bearer') {
                if (!authorization) {
                    return 0;
                }
                const token = authorization.split(' ')[1];
                const Crypto = require('crypto-js');
                const bytes = Crypto.AES.decrypt(token, cryptoSecret);
                const originalEncryptedString = bytes.toString(Crypto.enc.Utf8);
                const checkTokenRevoke: any = await connection.getRepository('AccessToken').findOne({
                    where: {
                        token: originalEncryptedString,
                    },
                });
                return checkTokenRevoke;
            }
            return 0;
        }

        // Check the token is revocked or not
        const checkRevoke = await checkTokenExist(request, cryptoSecret);
        if (!checkRevoke) {
            return false;
        }

        const validateCustomer = async (id: number) => {
            const customer = await connection.getRepository('Customer').findOne({
                where: {
                    id, isActive: 1, deleteFlag: 0,
                },
            });
            if (customer) {
                return customer;
            }
            return undefined;
        }

        const validateVendor = async (id: number) => {
            const vendors: any = await connection.getRepository('Vendor').findOne({
                where: {
                    vendorId: id,
                }, relations: ['customer'],
            });
            if (vendors) {
                if (vendors.isActive === 1 && vendors.customer.deleteFlag === 0 && vendors.approvalFlag === 1) {
                    return vendors;
                }
            }
            return undefined;
        }

        const validateUnapprovedVendor = async (id: number) => {
            const vendors: any = await connection.getRepository('Vendor').findOne({
                where: {
                    vendorId: id,
                }, relations: ['customer'],
            });
            if (vendors) {
                if (vendors.isActive === 1 && vendors.customer.deleteFlag === 0) {
                    return vendors;
                }
            }
            return undefined;
        }

        const validateUser = async (id: number) => {
            const user = await connection.getRepository('User').findOne({
                where: {
                    userId: id, deleteFlag: 0, isActive: 1,
                },
            });
            if (user) {
                return user;
            }

            return undefined;
        }

        const validateUserGroup = async (id: number) => {
            const group = await connection.getRepository('UserGroup').findOne({
                where: {
                    groupId: id,
                },
            });
            if (group) {
                return group;
            }
            return undefined;
        }

        if (roles[0] === 'customer') {
            action.request.user = await validateCustomer(userId.id);
            if (action.request.user === undefined) {
                return false;
            }
            return true;

        } else if (roles[0] === 'vendor') {
            action.request.user = await validateVendor(userId.id);
            if (action.request.user === undefined) {
                return false;
            }
            return true;

        } else if (roles[0] === 'vendor-unapproved') {
            action.request.user = await validateUnapprovedVendor(userId.id);
            if (action.request.user === undefined) {
                return false;
            }
            return true;

        } else if (roles[0] === 'admin-vendor') {
            if (userId.role === 'admin') {
                action.request.user = await validateUser(userId.id);
            } else if (userId.role === 'vendor') {
                action.request.user = await validateVendor(userId.id);
            }
            if (action.request.user === undefined) {
                return false;
            }
            return true;
        } else {
            action.request.user = await validateUser(userId.id);
            if (action.request.user === undefined) {
                return false;
            }
            const routeName = roles[1];
            const userGroupId = (action.request.user && action.request.user.userGroupId) ? action.request.user.userGroupId : undefined;
            if (userGroupId) {
                const getUserGroup: any = await validateUserGroup(userGroupId);
                if (getUserGroup) {
                    if (getUserGroup?.groupId === 1) {
                        return true;
                    } else {
                        if (routeName) {
                            let permissions: { [x: string]: any; };
                            if (action.request.user.permission) {
                                permissions = action.request.user.permission ? JSON.parse(action.request.user.permission) : {};
                            } else {
                                permissions = getUserGroup?.permission ? JSON.parse(getUserGroup.permission) : {};
                            }
                            if (permissions) {
                                if (!permissions[routeName]) {
                                    return false;
                                }
                            }
                        }
                    }

                }

            } else {
                return false;

            }
            return true;

        }
    };
}
