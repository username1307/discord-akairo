import AkairoError from '../../util/AkairoError';
import AkairoModule from '../AkairoModule';
export default class SlashCommand extends AkairoModule {
    constructor(id, options) {
        super(id, { category: options?.category });
        const { before = this.before || (() => undefined), channel = null, clientPermissions = this.clientPermissions, description, guarded = false, hidden = false, ignorePermissions, lock, name, ownerOnly = false, parentCommand, prefixId, shortName, slashDefaultPermission, slashOptions = [], commandType, userPermissions = this.userPermissions, } = options ?? {};
        this.before = before.bind(this);
        this.channel = channel;
        this.clientPermissions =
            typeof clientPermissions === 'function'
                ? clientPermissions.bind(this)
                : clientPermissions;
        this.description = description;
        this.guarded = Boolean(guarded);
        this.hidden = Boolean(hidden);
        this.lock = lock;
        this.name = name;
        this.ownerOnly = Boolean(ownerOnly);
        this.parentCommand = parentCommand;
        this.prefixId = prefixId;
        this.userPermissions =
            typeof userPermissions === 'function'
                ? userPermissions.bind(this)
                : userPermissions;
        if (typeof lock === 'string') {
            this.lock = {
                guild: (message) => message.guild && message.guild.id,
                channel: (message) => message.channel.id,
                user: (message) => message.author.id,
            }[lock];
        }
        if (this.lock)
            this.locker = new Set();
        this.ignorePermissions =
            typeof ignorePermissions === 'function'
                ? ignorePermissions.bind(this)
                : ignorePermissions;
        this.shortName = shortName;
        this.slashDefaultPermission = slashDefaultPermission;
        this.slashOptions = slashOptions;
        this.commandType = commandType;
    }
    before(message) { }
    exec(interaction, message, ...args) {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
    autocomplete(interaction) { }
}
//# sourceMappingURL=SlashCommand.js.map