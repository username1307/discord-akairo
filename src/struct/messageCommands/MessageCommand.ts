/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
import {
    ApplicationCommandAutocompleteOption,
    ApplicationCommandChannelOptionData,
    ApplicationCommandChoicesData,
    ApplicationCommandNonOptionsData,
    ApplicationCommandNumericOptionData,
    ApplicationCommandSubCommandData,
    ApplicationCommandSubGroupData,
    AutocompleteInteraction,
    Message,
    PermissionResolvable,
    Snowflake,
} from 'discord.js';
import AkairoError from '../../util/AkairoError.js';
import type AkairoMessage from '../../util/AkairoMessage.js';
import type Category from '../../util/Category.js';
import type AkairoClient from '../AkairoClient.js';
import AkairoModule, { AkairoModuleOptions } from '../AkairoModule.js';
import Argument, {
    ArgumentOptions,
    DefaultArgumentOptions,
} from './arguments/Argument.js';
import ArgumentRunner, {
    ArgumentRunnerState,
} from './arguments/ArgumentRunner.js';
import MessageCommandHandler, {
    IgnoreCheckPredicate,
    PrefixSupplier,
} from './MessageCommandHandler';
import ContentParser, { ContentParserResult } from './ContentParser.js';
import type Flag from './Flag.js';

/**
 * Represents a command.
 */
export default abstract class MessageCommand extends AkairoModule {
    /**
     * MessageCommand names.
     */
    public declare aliases: string[];

    /**
     * Argument options or generator.
     */
    public declare _args?: ArgumentOptions[] | ArgumentGenerator;

    /**
     * Default prompt options.
     */
    public declare argumentDefaults: DefaultArgumentOptions;

    /**
     * The argument runner.
     */
    public declare argumentRunner: ArgumentRunner;

    /**
     * Category the command belongs to.
     */
    public declare category: Category<string, MessageCommand>;

    /**
     * Usable only in this channel type.
     */
    public declare channel?: string;

    /**
     * The Akairo client.
     */
    public declare client: AkairoClient;

    /**
     * Permissions required to run command by the client.
     */
    public declare clientPermissions?:
        | PermissionResolvable
        | PermissionResolvable[]
        | MissingPermissionSupplier;

    /**
     * Cooldown in milliseconds.
     */
    public declare cooldown: number | null;

    /**
     * The content parser.
     */
    public declare contentParser: ContentParser;

    /**
     * Description of the command.
     */
    public declare description: string | any | any[];

    /**
     * Whether or not this command can be ran by an edit.
     */
    public declare editable: boolean;

    /**
     * The filepath.
     */
    public declare filepath: string;

    /**
     * The handler.
     */
    public declare handler: MessageCommandHandler;

    /**
     * The ID of the command.
     */
    public declare id: string;

    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    public declare ignoreCooldown?:
        | Snowflake
        | Snowflake[]
        | IgnoreCheckPredicate;

    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    public declare ignorePermissions?:
        | Snowflake
        | Snowflake[]
        | IgnoreCheckPredicate;

    /**
     * The key supplier for the locker.
     */
    public declare lock?: KeySupplier | 'channel' | 'guild' | 'user';

    /**
     * Stores the current locks.
     */
    public declare locker?: Set<string>;

    /**
     * Usable only by the client owner.
     */
    public declare ownerOnly: boolean;

    /**
     * MessageCommand prefix overwrite.
     */
    public declare prefix?: string | string[] | PrefixSupplier;

    /**
     * Whether or not to consider quotes.
     */
    public declare quoted: boolean;

    /**
     * Uses allowed before cooldown.
     */
    public declare ratelimit: number;

    /**
     * The regex trigger for this command.
     */
    public declare regex?: RegExp | RegexSupplier;

    /**
     * Whether to allow client superUsers(s) only.
     */
    public declare superUserOnly: boolean;

    /**
     * Whether or not to type during command execution.
     */
    public declare typing: boolean;

    /**
     * Permissions required to run command by the user.
     */
    public declare userPermissions?:
        | PermissionResolvable
        | PermissionResolvable[]
        | MissingPermissionSupplier;

    /**
     * Generator for arguments.
     */
    public declare argumentGenerator: ArgumentGenerator;

    /**
     * @param id - MessageCommand ID.
     * @param options - Options for the command.
     */
    constructor(id: string, options?: MessageCommandOptions) {
        super(id, { category: options?.category });

        const {
            aliases = [],
            args = this._args || this.args || [],
            argumentDefaults = {},
            before = this.before || (() => undefined),
            channel = null,
            clientPermissions = this.clientPermissions,
            condition = this.condition || (() => false),
            cooldown = null,
            description = '',
            editable = true,
            flags = [],
            ignoreCooldown,
            ignorePermissions,
            lock,
            optionFlags = [],
            ownerOnly = false,
            prefix = this.prefix,
            quoted = true,
            ratelimit = 1,
            regex = this.regex,
            separator,
            superUserOnly = false,
            typing = false,
            userPermissions = this.userPermissions,
        } = options ?? {};
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
        this.argumentGenerator = (
            Array.isArray(args)
                ? ArgumentRunner.fromArguments(
                      args.map((arg) => [arg.id!, new Argument(this, arg)])
                  )
                : args.bind(this)
        ) as ArgumentGenerator;
        this.argumentDefaults = argumentDefaults;
        this.before = before.bind(this);
        this.channel = channel!;
        this.clientPermissions =
            typeof clientPermissions === 'function'
                ? clientPermissions.bind(this)
                : clientPermissions;
        this.condition = condition.bind(this);
        this.cooldown = cooldown!;
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
                guild: (message: Message | AkairoMessage): string =>
                    message.guild! && message.guild.id!,
                channel: (message: Message | AkairoMessage): string =>
                    message.channel!.id,
                user: (message: Message | AkairoMessage): string =>
                    message.author.id,
            }[lock];
        }
        if (this.lock) this.locker = new Set();
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
    public *args(
        message: Message,
        parsed: ContentParserResult,
        state: ArgumentRunnerState
    ): IterableIterator<ArgumentOptions | Flag> {}

    /**
     * Runs before argument parsing and execution.
     * @param message - Message being handled.
     */
    public before(message: Message): any {}

    /**
     * Checks if the command should be ran by using an arbitrary condition.
     * @param message - Message being handled.
     */
    public condition(message: Message): boolean | Promise<boolean> {
        return false;
    }

    /**
     * Executes the command.
     * @param message - Message that triggered the command.
     * @param args - Evaluated arguments.
     */
    public exec(message: Message, args: any): any;
    public exec(message: Message | AkairoMessage, args: any): any;
    public exec(message: Message | AkairoMessage, args: any): any {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    /**
     * Respond to autocomplete interactions for this command.
     * @param interaction The autocomplete interaction
     */
    public autocomplete(interaction: AutocompleteInteraction): any {}

    /**
     * Parses content using the command's arguments.
     * @param message - Message to use.
     * @param content - String to parse.
     */
    public parse(message: Message, content: string): Promise<Flag | any> {
        const parsed = this.contentParser.parse(content);
        return this.argumentRunner.run(message, parsed, this.argumentGenerator);
    }
}

export default interface MessageCommand extends AkairoModule {
    /**
     * Reloads the command.
     */
    reload(): Promise<MessageCommand>;

    /**
     * Removes the command.
     */
    remove(): MessageCommand;
}

/**
 * Options to use for command execution behavior.
 */
export interface MessageCommandOptions extends AkairoModuleOptions {
    /**
     * MessageCommand names.
     * @default []
     */
    aliases?: string[];

    /**
     * Argument options or generator.
     * @default this._args || this.args || []
     */
    args?: ArgumentOptions[] | ArgumentGenerator;

    /**
     * The default argument options.
     * @default {}
     */
    argumentDefaults?: DefaultArgumentOptions;

    /**
     * Function to run before argument parsing and execution.
     * @default this.before || (() => undefined)
     */
    before?: BeforeAction;

    /**
     * Restricts channel to either 'guild' or 'dm'.
     * @default null
     */
    channel?: 'guild' | 'dm';

    /**
     * Permissions required by the client to run this command.
     * @default this.clientPermissions
     */
    clientPermissions?:
        | PermissionResolvable
        | PermissionResolvable[]
        | MissingPermissionSupplier;

    /**
     * Whether or not to run on messages that are not directly messageCommands.
     * @default this.condition || (() => false)
     */
    condition?: ExecutionPredicate;

    /**
     * The command cooldown in milliseconds.
     * @default null
     */
    cooldown?: number;

    /**
     * Description of the command.
     * @default ""
     */
    description?: string | any | any[];

    /**
     * Whether or not message edits will run this command.
     * @default true
     */
    editable?: boolean;

    /**
     * Flags to use when using an ArgumentGenerator
     * @default []
     */
    flags?: string[];

    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

    /**
     * The key type or key generator for the locker. If lock is a string, it's expected one of 'guild', 'channel', or 'user'
     */
    lock?: KeySupplier | 'guild' | 'channel' | 'user';

    /**
     * Option flags to use when using an ArgumentGenerator.
     * @default []
     */
    optionFlags?: string[];

    /**
     * Whether or not to allow client owner(s) only.
     * @default false
     */
    ownerOnly?: boolean;

    /**
     * The prefix(es) to overwrite the global one for this command.
     * @default this.prefix
     */
    prefix?: string | string[] | PrefixSupplier;

    /**
     * Whether or not to consider quotes.
     * @default true
     */
    quoted?: boolean;

    /**
     * Amount of command uses allowed until cooldown.
     * @default 1
     */
    ratelimit?: number;

    /**
     * A regex to match in messages that are not directly messageCommands. The args object will have `match` and `matches` properties.
     * @default this.regex
     */
    regex?: RegExp | RegexSupplier;

    /**
     * Custom separator for argument input.
     */
    separator?: string;

    /**
     * Whether to allow client superUsers(s) only.
     * @default false
     */
    superUserOnly?: boolean;

    /**
     * Whether or not to type in channel during execution.
     * @default false
     */
    typing?: boolean;

    /**
     * Permissions required by the user to run this command.
     * @default this.userPermissions
     */
    userPermissions?:
        | PermissionResolvable
        | PermissionResolvable[]
        | MissingPermissionSupplier;
}

/**
 * A function to run before argument parsing and execution.
 * @param message - Message that triggered the command.
 */
export type BeforeAction = (message: Message) => any;

/**
 * A function used to supply the key for the locker.
 * @param message - Message that triggered the command.
 * @param args - Evaluated arguments.
 */
export type KeySupplier = (
    message: Message | AkairoMessage,
    args: any
) => string;

/**
 * A function used to check if the command should run arbitrarily.
 * @param message - Message to check.
 */
export type ExecutionPredicate = (
    message: Message
) => boolean | Promise<boolean>;

/**
 * A function used to check if a message has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @param message - Message that triggered the command.
 */
export type MissingPermissionSupplier = (
    message: Message | AkairoMessage
) => Promise<any> | any;

/**
 * A function used to return a regular expression.
 * @param message - Message to get regex for.
 */
export type RegexSupplier = (message: Message) => RegExp;

/**
 * Generator for arguments.
 * When yielding argument options, that argument is ran and the result of the processing is given.
 * The last value when the generator is done is the resulting `args` for the command's `exec`.
 * @param message - Message that triggered the command.
 * @param parsed - Parsed content.
 * @param state - Argument processing state.
 */
export type ArgumentGenerator = (
    message: Message,
    parsed: ContentParserResult,
    state: ArgumentRunnerState
) => IterableIterator<ArgumentOptions | Flag>;
