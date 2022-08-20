"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_js_1 = require("../../util/AkairoError.js");
const Util_js_1 = require("../../util/Util.js");
const AkairoHandler_js_1 = require("../AkairoHandler.js");
const Inhibitor_js_1 = require("./Inhibitor.js");
/**
 * Loads inhibitors and checks messages.
 */
class InhibitorHandler extends AkairoHandler_js_1.default {
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client, options) {
        const { directory, classToHandle = Inhibitor_js_1.default, extensions = ['.js', '.ts'], automateCategories, loadFilter, } = options ?? {};
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
    async test(type, message, command) {
        if (!this.modules.size)
            return null;
        const inhibitors = this.modules.filter((i) => i.type === type);
        if (!inhibitors.size)
            return null;
        const promises = [];
        for (const inhibitor of inhibitors.values()) {
            promises.push((async () => {
                let inhibited = inhibitor.exec(message, command);
                if (Util_js_1.default.isPromise(inhibited))
                    inhibited = await inhibited;
                if (inhibited)
                    return inhibitor;
                return null;
            })());
        }
        const inhibitedInhibitors = (await Promise.all(promises)).filter((r) => r);
        if (!inhibitedInhibitors.length)
            return null;
        inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
        return inhibitedInhibitors[0].reason;
    }
}
exports.default = InhibitorHandler;
//# sourceMappingURL=InhibitorHandler.js.map