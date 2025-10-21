"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = void 0;
const tslib_1 = require("tslib");
const bcrypt = (0, tslib_1.__importStar)(require("bcrypt"));
const hashPassword = (password) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return reject(err);
            }
            resolve(hash);
        });
    });
});
exports.hashPassword = hashPassword;
//# sourceMappingURL=vendor-service-utils.js.map