import { Client, } from 'discord.js';
import ClientUtil from './ClientUtil.js';
/**
 * The Akairo framework client. Creates the handlers and sets them up.
 */
export default class AkairoClient extends Client {
    constructor(options, clientOptions) {
        const combinedOptions = { ...options, ...clientOptions };
        super(combinedOptions);
        this.ownerID = combinedOptions.ownerID ?? [];
        this.util = new ClientUtil(this);
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
//# sourceMappingURL=AkairoClient.js.map