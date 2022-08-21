"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_js_1 = __importDefault(require("../../util/AkairoError.js"));
const AkairoModule_js_1 = __importDefault(require("../AkairoModule.js"));
/**
 * Represents an inhibitor.
 */
class Inhibitor extends AkairoModule_js_1.default {
    /**
     * @param id - Inhibitor ID.
     * @param options - Options for the inhibitor.
     */
    constructor(id, options) {
        const { category, reason = '', type = 'post', priority = 0, } = options ?? {};
        super(id, { category });
        this.reason = reason;
        this.type = type;
        this.priority = priority;
    }
    exec(message, command) {
        throw new AkairoError_js_1.default('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
}
exports.default = Inhibitor;
//# sourceMappingURL=Inhibitor.js.map