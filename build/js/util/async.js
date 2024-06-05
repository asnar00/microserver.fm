// ᕦ(ツ)ᕤ
// async.ts
// async logging utility functions
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class AsyncLocalStorage {
    constructor() {
        this.map = new Map();
        this.id = 0;
    }
    run(store, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = ++this.id;
            this.map.set(id, store);
            try {
                let result = callback();
                if (result instanceof Promise) {
                    result = yield result;
                }
                console.log("callback-result:", result);
                return result;
            }
            finally {
                this.map.delete(id);
            }
        });
    }
    getStore() {
        const id = this.id;
        return this.map.get(id);
    }
}
