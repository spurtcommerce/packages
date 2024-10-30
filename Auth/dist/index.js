"use strict";
/*
 * Spurtcommerce Auth Npm
 * version 1.0.9
 * Copyrights © 2023, Spurtcommerce Esolutions Private Limited
 * Author Spurtcommerce Esolutions Pvt Ltd <support@spurtcommerce.com>
 * Licensed under the MIT license.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizationChecker = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
function authorizationChecker(connection, jwtSecret, cryptoSecret, additionalInfo) {
    return function innerAuthorizationChecker(action, roles) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = action.request;
            const parseBasicAuthFromRequest = (req, jwtSecret, cryptoSecret) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const authorization = req.header('authorization');
                if (authorization && authorization.split(' ')[0] === 'Bearer') {
                    if (!authorization) {
                        return undefined;
                    }
                    const UserId = yield decryptToken(authorization.split(' ')[1]);
                    console.log(JSON.stringify(UserId) + 'UserId:');
                    return UserId;
                }
                return undefined;
            });
            const decryptToken = (encryptString) => {
                const Crypto = require('crypto-js');
                const bytes = Crypto.AES.decrypt(encryptString, cryptoSecret);
                const originalEncryptedString = bytes.toString(Crypto.enc.Utf8);
                return new Promise((subresolve, subreject) => {
                    jsonwebtoken_1.default.verify(originalEncryptedString, jwtSecret, (err, decoded) => {
                        if (err) {
                            return subresolve(undefined);
                        }
                        return subresolve({ id: decoded.id, role: decoded.role, userType: decoded.userType });
                    });
                });
            };
            // const userId = await parseBasicAuthFromRequest(action.request, jwtSecret, cryptoSecret);
            const userId = yield parseBasicAuthFromRequest(request, jwtSecret, cryptoSecret);
            if (userId === undefined) {
                return false;
            }
            const checkTokenExist = (req, cryptoSecret) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const authorization = req.header('authorization');
                if (authorization && authorization.split(' ')[0] === 'Bearer') {
                    if (!authorization) {
                        return 0;
                    }
                    const token = authorization.split(' ')[1];
                    const Crypto = require('crypto-js');
                    const bytes = Crypto.AES.decrypt(token, cryptoSecret);
                    const originalEncryptedString = bytes.toString(Crypto.enc.Utf8);
                    const checkTokenRevoke = yield connection.getRepository('AccessToken').findOne({
                        where: {
                            token: originalEncryptedString,
                        },
                    });
                    return checkTokenRevoke;
                }
                return 0;
            });
            // Check the token is revocked or not
            const checkRevoke = yield checkTokenExist(request, cryptoSecret);
            if (!checkRevoke) {
                return false;
            }
            const validateCustomer = (id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const customer = yield connection.getRepository('Customer').findOne({
                    where: {
                        id, isActive: 1, deleteFlag: 0,
                    },
                });
                if (customer) {
                    return customer;
                }
                return undefined;
            });
            const validateVendor = (id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const vendors = yield connection.getRepository('Vendor').findOne({
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
            });
            const validateUnapprovedVendor = (id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const vendors = yield connection.getRepository('Vendor').findOne({
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
            });
            const validateUser = (id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = yield connection.getRepository('User').findOne({
                    where: {
                        userId: id, deleteFlag: 0, isActive: 1,
                    },
                });
                if (user) {
                    return user;
                }
                return undefined;
            });
            const validateUserGroup = (id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const group = yield connection.getRepository('UserGroup').findOne({
                    where: {
                        groupId: id,
                    },
                });
                if (group) {
                    return group;
                }
                return undefined;
            });
            if (roles[0] === 'customer') {
                action.request.user = yield validateCustomer(userId.id);
                if (action.request.user === undefined) {
                    return false;
                }
                return true;
            }
            else if (roles[0] === 'vendor') {
                action.request.user = yield validateVendor(userId.id);
                if (action.request.user === undefined) {
                    return false;
                }
                return true;
            }
            else if (roles[0] === 'vendor-unapproved') {
                action.request.user = yield validateUnapprovedVendor(userId.id);
                if (action.request.user === undefined) {
                    return false;
                }
                return true;
            }
            else if (roles[0] === 'admin-vendor') {
                if (userId.role === 'admin') {
                    action.request.user = yield validateUser(userId.id);
                }
                else if (userId.role === 'vendor') {
                    action.request.user = yield validateVendor(userId.id);
                }
                if (action.request.user === undefined) {
                    return false;
                }
                return true;
            }
            else {
                action.request.user = yield validateUser(userId.id);
                if (action.request.user === undefined) {
                    return false;
                }
                const routeName = roles[1];
                const userGroupId = (action.request.user && action.request.user.userGroupId) ? action.request.user.userGroupId : undefined;
                if (userGroupId) {
                    const getUserGroup = yield validateUserGroup(userGroupId);
                    if (getUserGroup) {
                        if ((getUserGroup === null || getUserGroup === void 0 ? void 0 : getUserGroup.groupId) === 1) {
                            return true;
                        }
                        else {
                            if (routeName) {
                                let permissions;
                                if (action.request.user.permission) {
                                    permissions = action.request.user.permission ? JSON.parse(action.request.user.permission) : {};
                                }
                                else {
                                    permissions = (getUserGroup === null || getUserGroup === void 0 ? void 0 : getUserGroup.permission) ? JSON.parse(getUserGroup.permission) : {};
                                }
                                if (permissions) {
                                    if (!permissions[routeName]) {
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    return false;
                }
                return true;
            }
        });
    };
}
exports.authorizationChecker = authorizationChecker;
//# sourceMappingURL=index.js.map