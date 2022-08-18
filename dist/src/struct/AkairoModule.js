"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base class for a module.
 */
class AkairoModule {
    /**
     * @param id - ID of module.
     * @param options - Options.
     */
    constructor(id, options) {
        const { category = 'default' } = options !== null && options !== void 0 ? options : {};
        this.id = id;
        this.categoryID = category;
        this.category = null;
        this.filepath = null;
        this.client = null;
        this.handler = null;
    }
    /**
     * Reloads the module.
     */
    reload() {
        var _a;
        return (_a = this.handler) === null || _a === void 0 ? void 0 : _a.reload(this.id);
    }
    /**
     * Removes the module.
     */
    remove() {
        var _a;
        return (_a = this.handler) === null || _a === void 0 ? void 0 : _a.remove(this.id);
    }
    /**
     * Returns the ID.
     */
    toString() {
        return this.id;
    }
}
exports.default = AkairoModule;
//# sourceMappingURL=AkairoModule.js.map