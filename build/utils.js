"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter = exports.waitUntil = void 0;
function waitUntil(condition, duration) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise(resolve => {
            const interval = setInterval(() => {
                console.log("Interval Ran");
                console.log(condition);
                if (condition) {
                    clearInterval(interval);
                    resolve(condition);
                }
                ;
            }, duration);
        });
    });
}
exports.waitUntil = waitUntil;
function filter(arr, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const fail = Symbol();
        return (yield Promise.all(arr.map((item) => __awaiter(this, void 0, void 0, function* () { return (yield callback(item)) ? item : fail; })))).filter(i => i !== fail);
    });
}
exports.filter = filter;
