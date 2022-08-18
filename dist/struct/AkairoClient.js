"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ClientUtil_js_1 = __importDefault(require("./ClientUtil.js"));
/**
 * The Akairo framework client. Creates the handlers and sets them up.
 */
class AkairoClient extends discord_js_1.Client {
    constructor(options, clientOptions) {
        const combinedOptions = { ...options, ...clientOptions };
        super(combinedOptions);
        this.ownerID = combinedOptions.ownerID ?? [];
        this.util = new ClientUtil_js_1.default(this);
    }
    /**
     * Checks if a user is the owner of this bot.
     * @param user - User to check.
     */
    isOwner(user) {
        const id = this.users.resolveId(user);
        if (!id)
            return false;
        return Array.isArray(this.ownerID)
            ? this.ownerID.includes(id)
            : id === this.ownerID;
    }
}
exports.default = AkairoClient;
//# sourceMappingURL=AkairoClient.js.map