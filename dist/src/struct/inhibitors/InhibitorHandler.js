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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_js_1 = __importDefault(require("../../util/AkairoError.js"));
const Util_js_1 = __importDefault(require("../../util/Util.js"));
const AkairoHandler_js_1 = __importDefault(require("../AkairoHandler.js"));
const Inhibitor_js_1 = __importDefault(require("./Inhibitor.js"));
/**
 * Loads inhibitors and checks messages.
 */
class InhibitorHandler extends AkairoHandler_js_1.default {
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client, options) {
        const { directory, classToHandle = Inhibitor_js_1.default, extensions = ['.js', '.ts'], automateCategories, loadFilter, } = options !== null && options !== void 0 ? options : {};
        if (!(classToHandle.prototype instanceof Inhibitor_js_1.default ||
            classToHandle === Inhibitor_js_1.default)) {
            throw new AkairoError_js_1.default('INVALID_CLASS_TO_HANDLE', classToHandle.name, Inhibitor_js_1.default.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter,
        });
    }
    /**
     * Tests inhibitors against the message.
     * Returns the reason if blocked.
     * @param type - Type of inhibitor, 'all', 'pre', or 'post'.
     * @param message - Message to test.
     * @param command - MessageCommand to use.
     */
    test(type, message, command) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.modules.size)
                return null;
            const inhibitors = this.modules.filter((i) => i.type === type);
            if (!inhibitors.size)
                return null;
            const promises = [];
            for (const inhibitor of inhibitors.values()) {
                promises.push((() => __awaiter(this, void 0, void 0, function* () {
                    let inhibited = inhibitor.exec(message, command);
                    if (Util_js_1.default.isPromise(inhibited))
                        inhibited = yield inhibited;
                    if (inhibited)
                        return inhibitor;
                    return null;
                }))());
            }
            const inhibitedInhibitors = (yield Promise.all(promises)).filter((r) => r);
            if (!inhibitedInhibitors.length)
                return null;
            inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
            return inhibitedInhibitors[0].reason;
        });
    }
}
exports.default = InhibitorHandler;
//# sourceMappingURL=InhibitorHandler.js.map