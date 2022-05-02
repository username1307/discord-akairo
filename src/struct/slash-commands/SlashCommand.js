const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');

class SlashCommand extends AkairoModule {
    constructor(id, options = {}) {
        super(id, { category: options.category });

        const {
            args = [],
            channel = null,
            commandType,
            name = '',
            prefixId = null,
            parentCommandName,
            shortCommandName = '',
            ownerOnly = false,
            description = '',
            clientPermissions = this.clientPermissions,
            userPermissions = this.userPermissions,
            ignorePermissions
        } = options;

        /**
         * The slash commands options.
         * @type {?any}
         */
        this.args = args;

        /**
         * The type of slash command.
         * @type {?string}
         */
        this.commandType = commandType;

        /**
         * The name of a sub commands or sub command group parent command.
         * @type {?string}
         */
        this.parentCommandName = parentCommandName;

        /**
         * The short name of a sub commands or sub command group.
         * @type {?string}
         */
        this.shortCommandName = shortCommandName;

        /**
         * Usable only in this channel type.
         * @type {?string}
         */
        this.channel = channel;

        /**
         * The name of the slash command.
         * @type {string}
         */
        this.name = name;

        /**
         * The name of a corresponding prefix command id.
         * @type {?string}
         */
        this.prefixId = prefixId;

        /**
         * Usable only by the client owner.
         * @type {boolean}
         */
        this.ownerOnly = Boolean(ownerOnly);

        /**
         * Description of the command.
         * @type {string|any}
         */
        this.description = Array.isArray(description) ? description.join('\n') : description;

        /**
         * Permissions required to run command by the client.
         * @type {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier}
         */
        this.clientPermissions = typeof clientPermissions === 'function' ? clientPermissions.bind(this) : clientPermissions;

        /**
         * Permissions required to run command by the user.
         * @type {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier}
         */
        this.userPermissions = typeof userPermissions === 'function' ? userPermissions.bind(this) : userPermissions;

        /**
         * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
         * @type {?Snowflake|Snowflake[]|IgnoreCheckPredicate}
         */
        this.ignorePermissions = typeof ignorePermissions === 'function' ? ignorePermissions.bind(this) : ignorePermissions;

        /**
         * The ID of this command.
         * @name Command#id
         * @type {string}
         */

        /**
         * The command handler.
         * @name Command#handler
         * @type {CommandHandler}
         */
    }

    /**
     * Executes the slash command.
     * @abstract
     * @param {CommandInteraction} interaction - Interaction that triggered the command.
     * @returns {any}
     */
    exec() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    /**
     * Executes the autocomplete.
     * @abstract
     * @param {AutocompleteInteraction} interaction - Interaction that triggered the autocomplete.
     * @returns {any}
     */
    // eslint-disable-next-line no-empty-function
    autocomplete() {}

    /**
     * Reloads the command.
     * @method
     * @name Command#reload
     * @returns {Command}
     */

    /**
     * Removes the command.
     * @method
     * @name Command#remove
     * @returns {Command}
     */
}

module.exports = SlashCommand;
