"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_js_1 = require("../../util/AkairoError.js");
const AkairoModule_js_1 = require("../AkairoModule.js");
/**
 * Represents a listener.
 */
class Listener extends AkairoModule_js_1.default {
    /**
     * @param id - Listener ID.
     * @param options - Options for the listener.
     */
    constructor(id, options) {
        const { category, emitter, event, type = 'on' } = options;
        super(id, { category });
        this.emitter = emitter;
        this.event = event;
        this.type = type;
    }
    /**
     * Executes the listener.
     * @param args - Arguments.
     */
    exec(...args) {
        throw new AkairoError_js_1.default('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
}
exports.default = Listener;
//# sourceMappingURL=Listener.js.map