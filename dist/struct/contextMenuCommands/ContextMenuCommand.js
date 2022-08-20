"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_js_1 = require("../../util/AkairoError.js");
const AkairoModule_js_1 = require("../AkairoModule.js");
/**
 * Represents a context menu command.
 */
class ContextMenuCommand extends AkairoModule_js_1.default {
    /**
     * @param id - Listener ID.
     * @param options - Options for the context menu command.
     */
    constructor(id, options) {
        const { category, guilds, name, ownerOnly, superUserOnly, type } = options;
        super(id, { category });
        this.guilds = guilds;
        this.name = name;
        this.ownerOnly = ownerOnly;
        this.superUserOnly = superUserOnly;
        this.type = type;
    }
    /**
     * Executes the context menu command.
     * @param interaction - The context menu command interaction.
     */
    exec(interaction) {
        throw new AkairoError_js_1.default('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
}
exports.default = ContextMenuCommand;
//# sourceMappingURL=ContextMenuCommand.js.map