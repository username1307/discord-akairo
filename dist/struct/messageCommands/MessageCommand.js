import AkairoError from '../../util/AkairoError.js';
import AkairoModule from '../AkairoModule.js';
import Argument from './arguments/Argument.js';
import ArgumentRunner from './arguments/ArgumentRunner.js';
import ContentParser from './ContentParser.js';
/**
 * Represents a command.
 */
export default class MessageCommand extends AkairoModule {
    /**
     * @param id - MessageCommand ID.
     * @param options - Options for the command.
     */
    constructor(id, options) {
        super(id, { category: options?.category });
        const { aliases = [], args = this._args || this.args || [], argumentDefaults = {}, before = this.before || (() => undefined), channel = null, clientPermissions = this.clientPermissions, condition = this.condition || (() => false), cooldown = null, description = '', editable = true, flags = [], ignoreCooldown, ignorePermissions, lock, optionFlags = [], ownerOnly = false, prefix = this.prefix, quoted = true, ratelimit = 1, regex = this.regex, separator, superUserOnly = false, typing = false, userPermissions = this.userPermissions, } = options ?? {};
        this.aliases = aliases;
        const { flagWords, optionFlagWords } = Array.isArray(args)
            ? ContentParser.getFlags(args)
            : { flagWords: flags, optionFlagWords: optionFlags };
        this.contentParser = new ContentParser({
            flagWords,
            optionFlagWords,
            quoted,
            separator,
        });
        this.argumentRunner = new ArgumentRunner(this);
        this.argumentGenerator = (Array.isArray(args)
            ? ArgumentRunner.fromArguments(args.map((arg) => [arg.id, new Argument(this, arg)]))
            : args.bind(this));
        this.argumentDefaults = argumentDefaults;
        this.before = before.bind(this);
        this.channel = channel;
        this.clientPermissions =
            typeof clientPermissions === 'function'
                ? clientPermissions.bind(this)
                : clientPermissions;
        this.condition = condition.bind(this);
        this.cooldown = cooldown;
        this.description = Array.isArray(description)
            ? description.join('\n')
            : description;
        this.editable = Boolean(editable);
        this.lock = lock;
        this.ownerOnly = Boolean(ownerOnly);
        this.prefix = typeof prefix === 'function' ? prefix.bind(this) : prefix;
        this.ratelimit = ratelimit;
        this.regex = typeof regex === 'function' ? regex.bind(this) : regex;
        this.superUserOnly = Boolean(superUserOnly);
        this.typing = Boolean(typing);
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
        this.ignoreCooldown =
            typeof ignoreCooldown === 'function'
                ? ignoreCooldown.bind(this)
                : ignoreCooldown;
        this.ignorePermissions =
            typeof ignorePermissions === 'function'
                ? ignorePermissions.bind(this)
                : ignorePermissions;
    }
    /**
     * Generator for arguments.
     * When yielding argument options, that argument is ran and the result of the processing is given.
     * The last value when the generator is done is the resulting `args` for the command's `exec`.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed content.
     * @param state - Argument processing state.
     */
    *args(message, parsed, state) { }
    /**
     * Runs before argument parsing and execution.
     * @param message - Message being handled.
     */
    before(message) { }
    /**
     * Checks if the command should be ran by using an arbitrary condition.
     * @param message - Message being handled.
     */
    condition(message) {
        return false;
    }
    exec(message, args) {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
    /**
     * Respond to autocomplete interactions for this command.
     * @param interaction The autocomplete interaction
     */
    autocomplete(interaction) { }
    /**
     * Parses content using the command's arguments.
     * @param message - Message to use.
     * @param content - String to parse.
     */
    parse(message, content) {
        const parsed = this.contentParser.parse(content);
        return this.argumentRunner.run(message, parsed, this.argumentGenerator);
    }
}
//# sourceMappingURL=MessageCommand.js.map