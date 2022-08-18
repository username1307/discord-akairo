import {
    Awaitable,
    Collection,
    ChannelType,
    Message,
    Snowflake,
    TextBasedChannel,
    User,
} from 'discord.js';
import type { MessageCommandHandlerEvents as MessageCommandHandlerEventsType } from '../../typings/events';
import AkairoError from '../../util/AkairoError.js';
import AkairoMessage from '../../util/AkairoMessage.js';
import type Category from '../../util/Category.js';
import { BuiltInReasons, CommandHandlerEvents } from '../../util/Constants.js';
import Util from '../../util/Util.js';
import AkairoClient from '../AkairoClient.js';
import AkairoHandler, {
    AkairoHandlerOptions,
    LoadPredicate,
} from '../AkairoHandler.js';
import type AkairoModule from '../AkairoModule.js';
import ContextMenuCommandHandler from '../contextMenuCommands/ContextMenuCommandHandler.js';
import type InhibitorHandler from '../inhibitors/InhibitorHandler.js';
import type ListenerHandler from '../listeners/ListenerHandler.js';
import type { DefaultArgumentOptions } from './arguments/Argument.js';
import TypeResolver from './arguments/TypeResolver.js';
import MessageCommand, { KeySupplier } from './MessageCommand';
import MessageCommandUtil from './MessageCommandUtil';
import Flag from './Flag.js';

/**
 * Loads messageCommands and handles messages.
 */
export default class MessageCommandHandler extends AkairoHandler {
    /**
     * Collection of command aliases.
     */
    public declare aliases: Collection<string, string>;

    /**
     * Regular expression to automatically make command aliases for.
     */
    public declare aliasReplacement?: RegExp;

    /**
     * Whether mentions are allowed for prefixing.
     */
    public declare allowMention: boolean | MentionPrefixPredicate;

    /**
     * Default argument options.
     */
    public declare argumentDefaults: DefaultArgumentOptions;

    /**
     * Whether or not to block bots.
     */
    public declare blockBots: boolean;

    /**
     * Whether to block self.
     */
    public declare blockClient: boolean;

    /**
     * Categories, mapped by ID to Category.
     */
    public declare categories: Collection<
        string,
        Category<string, MessageCommand>
    >;

    /**
     * Class to handle
     */
    public declare classToHandle: typeof MessageCommand;

    /**
     * The Akairo client.
     */
    public declare client: AkairoClient;

    /**
     * Whether `message.util` is assigned.
     */
    public declare commandUtil: boolean;

    /**
     * Milliseconds a message should exist for before its command util instance is marked for removal.
     */
    public declare commandUtilLifetime: number;

    /**
     * Collection of CommandUtils.
     */
    public declare commandUtils: Collection<
        string,
        MessageCommandUtil<Message | AkairoMessage>
    >;

    /**
     * Time interval in milliseconds for sweeping command util instances.
     */
    public declare commandUtilSweepInterval: number;

    /**
     * Collection of cooldowns.
     * <info>The elements in the collection are objects with user IDs as keys
     * and {@link CooldownData} objects as values</info>
     */
    public declare cooldowns: Collection<
        string,
        { [id: string]: CooldownData }
    >;

    /**
     * Default cooldown for messageCommands.
     */
    public declare defaultCooldown: number;

    /**
     * Directory to messageCommands.
     */
    public declare directory: string;

    /**
     * Whether or not members are fetched on each message author from a guild.
     */
    public declare fetchMembers: boolean;

    /**
     * Whether or not edits are handled.
     */
    public declare handleEdits: boolean;

    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    public declare ignoreCooldown:
        | Snowflake
        | Snowflake[]
        | IgnoreCheckPredicate;

    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    public declare ignorePermissions:
        | Snowflake
        | Snowflake[]
        | IgnoreCheckPredicate;

    /**
     * Inhibitor handler to use.
     */
    public declare inhibitorHandler: InhibitorHandler | null;

    /**
     * Commands loaded, mapped by ID to MessageCommand.
     */
    public declare modules: Collection<string, MessageCommand>;

    /**
     * The prefix(es) for command parsing.
     */
    public declare prefix: string | string[] | PrefixSupplier;

    /**
     * Collection of prefix overwrites to messageCommands.
     */
    public declare prefixes: Collection<string | PrefixSupplier, Set<string>>;

    /**
     * Collection of sets of ongoing argument prompts.
     */
    public declare prompts: Collection<string, Set<string>>;

    /**
     * The type resolver.
     */
    public declare resolver: TypeResolver;

    /**
     * Whether or not to store messages in MessageCommandUtil.
     */
    public declare storeMessages: boolean;

    /**
     * Show "BotName is typing" information message on the text channels when a command is running.
     */
    public declare typing: boolean;

    /**
     * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
     */
    public declare skipBuiltInPostInhibitors: boolean;

    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    public constructor(
        client: AkairoClient,
        options: MessageCommandHandlerOptions
    ) {
        const {
            directory,
            classToHandle = MessageCommand,
            extensions = ['.js', '.ts'],
            automateCategories,
            loadFilter,
            blockClient = true,
            blockBots = true,
            fetchMembers = false,
            handleEdits = false,
            storeMessages = false,
            commandUtil,
            commandUtilLifetime = 3e5,
            commandUtilSweepInterval = 3e5,
            defaultCooldown = 0,
            ignoreCooldown = client.ownerID,
            ignorePermissions = [],
            argumentDefaults = {},
            prefix = '!',
            allowMention = true,
            aliasReplacement,
            typing = false,
            skipBuiltInPostInhibitors = false,
        } = options ?? {};

        if (
            !(
                classToHandle.prototype instanceof MessageCommand ||
                classToHandle === MessageCommand
            )
        ) {
            throw new AkairoError(
                'INVALID_CLASS_TO_HANDLE',
                classToHandle.name,
                MessageCommand.name
            );
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter,
        });

        this.typing = typing;
        this.resolver = new TypeResolver(this);
        this.aliases = new Collection();
        this.aliasReplacement = aliasReplacement;
        this.prefixes = new Collection();
        this.blockClient = Boolean(blockClient);
        this.blockBots = Boolean(blockBots);
        this.fetchMembers = Boolean(fetchMembers);
        this.handleEdits = Boolean(handleEdits);
        this.storeMessages = Boolean(storeMessages);
        this.commandUtil = Boolean(commandUtil);
        if ((this.handleEdits || this.storeMessages) && !this.commandUtil)
            throw new AkairoError('COMMAND_UTIL_EXPLICIT');
        this.commandUtilLifetime = commandUtilLifetime;
        this.commandUtilSweepInterval = commandUtilSweepInterval;
        if (this.commandUtilSweepInterval > 0)
            setInterval(
                () => this.sweepCommandUtil(),
                this.commandUtilSweepInterval
            ).unref();
        this.commandUtils = new Collection();
        this.cooldowns = new Collection();
        this.defaultCooldown = defaultCooldown;
        this.ignoreCooldown =
            typeof ignoreCooldown === 'function'
                ? ignoreCooldown.bind(this)
                : ignoreCooldown;
        this.ignorePermissions =
            typeof ignorePermissions === 'function'
                ? ignorePermissions.bind(this)
                : ignorePermissions;
        this.prompts = new Collection();
        this.argumentDefaults = Util.deepAssign(
            {
                prompt: {
                    start: '',
                    retry: '',
                    timeout: '',
                    ended: '',
                    cancel: '',
                    retries: 1,
                    time: 30000,
                    cancelWord: 'cancel',
                    stopWord: 'stop',
                    optional: false,
                    infinite: false,
                    limit: Infinity,
                    breakout: true,
                },
            },
            argumentDefaults
        );
        this.prefix = typeof prefix === 'function' ? prefix.bind(this) : prefix;
        this.allowMention =
            typeof allowMention === 'function'
                ? allowMention.bind(this)
                : Boolean(allowMention);
        this.inhibitorHandler = null;
        this.skipBuiltInPostInhibitors = Boolean(skipBuiltInPostInhibitors);
        this.setup();
    }

    /**
     * Set up the command handler
     */
    protected setup() {
        this.client.once('ready', () => {
            this.client.on('messageCreate', async (m) => {
                if (m.partial) await m.fetch();

                this.handle(m);
            });

            if (this.handleEdits) {
                this.client.on('messageUpdate', async (o, m) => {
                    if (o.partial) await o.fetch();
                    if (m.partial) await m.fetch();
                    if (o.content === m.content) return;

                    if (this.handleEdits) this.handle(m as Message);
                });
            }
        });

        if (this.commandUtil)
            this.client.on('messageDelete', (message) => {
                if (message.inGuild()) {
                    MessageCommandUtil.deletedMessages.add(message.id);
                }
            });
    }

    /**
     * Registers a module.
     * @param command - Module to use.
     * @param filepath - Filepath of module.
     */
    public override register(command: MessageCommand, filepath?: string): void {
        super.register(command, filepath);

        for (let alias of command.aliases) {
            const conflict = this.aliases.get(alias.toLowerCase());
            if (conflict)
                throw new AkairoError(
                    'ALIAS_CONFLICT',
                    alias,
                    command.id,
                    conflict
                );

            alias = alias.toLowerCase();
            this.aliases.set(alias, command.id);
            if (this.aliasReplacement) {
                const replacement = alias.replace(this.aliasReplacement, '');

                if (replacement !== alias) {
                    const replacementConflict = this.aliases.get(replacement);
                    if (replacementConflict)
                        throw new AkairoError(
                            'ALIAS_CONFLICT',
                            replacement,
                            command.id,
                            replacementConflict
                        );
                    this.aliases.set(replacement, command.id);
                }
            }
        }

        if (command.prefix != null) {
            let newEntry = false;

            if (Array.isArray(command.prefix)) {
                for (const prefix of command.prefix) {
                    const prefixes = this.prefixes.get(prefix);
                    if (prefixes) {
                        prefixes.add(command.id);
                    } else {
                        this.prefixes.set(prefix, new Set([command.id]));
                        newEntry = true;
                    }
                }
            } else {
                const prefixes = this.prefixes.get(command.prefix);
                if (prefixes) {
                    prefixes.add(command.id);
                } else {
                    this.prefixes.set(command.prefix, new Set([command.id]));
                    newEntry = true;
                }
            }

            if (newEntry) {
                this.prefixes = this.prefixes.sort((aVal, bVal, aKey, bKey) =>
                    Util.prefixCompare(aKey, bKey)
                );
            }
        }
    }

    /**
     * Deregisters a module.
     * @param command - Module to use.
     */
    public override deregister(command: MessageCommand): void {
        for (let alias of command.aliases) {
            alias = alias.toLowerCase();
            this.aliases.delete(alias);

            if (this.aliasReplacement) {
                const replacement = alias.replace(this.aliasReplacement, '');
                if (replacement !== alias) this.aliases.delete(replacement);
            }
        }

        if (command.prefix != null) {
            if (Array.isArray(command.prefix)) {
                for (const prefix of command.prefix) {
                    const prefixes = this.prefixes.get(prefix);
                    if (prefixes?.size === 1) {
                        this.prefixes.delete(prefix);
                    } else {
                        prefixes?.delete(prefix);
                    }
                }
            } else {
                const prefixes = this.prefixes.get(command.prefix);
                if (prefixes?.size === 1) {
                    this.prefixes.delete(command.prefix);
                } else {
                    prefixes?.delete(command.prefix as string);
                }
            }
        }

        super.deregister(command);
    }

    /**
     * Handles a message.
     * @param message - Message to handle.
     */
    public async handle(message: Message): Promise<boolean | null> {
        try {
            if (
                this.fetchMembers &&
                message.guild &&
                !message.member &&
                !message.webhookId
            ) {
                await message.guild.members.fetch(message.author);
            }

            if (await this.runAllTypeInhibitors(message)) {
                return false;
            }

            if (this.commandUtil) {
                if (this.commandUtils.has(message.id)) {
                    message.util = this.commandUtils.get(
                        message.id
                    ) as MessageCommandUtil<Message>;
                } else {
                    message.util = new MessageCommandUtil(this, message);
                    this.commandUtils.set(message.id, message.util);
                }
            }

            if (await this.runPreTypeInhibitors(message)) {
                return false;
            }

            let parsed = await this.parseCommand(message);
            if (!parsed.command) {
                const overParsed = await this.parseCommandOverwrittenPrefixes(
                    message
                );
                if (
                    overParsed.command ||
                    (parsed.prefix == null && overParsed.prefix != null)
                ) {
                    parsed = overParsed;
                }
            }

            if (this.commandUtil) {
                message.util!.parsed = parsed;
            }

            let ran;
            if (!parsed.command) {
                ran = await this.handleRegexAndConditionalCommands(message);
            } else {
                ran = await this.handleDirectCommand(
                    message,
                    parsed.content!,
                    parsed.command
                );
            }

            if (ran === false) {
                this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
                return false;
            }

            return ran;
        } catch (err: any) {
            this.emitError(err, message);
            return null;
        }
    }

    /**
     * Handles normal messageCommands.
     * @param message - Message to handle.
     * @param content - Content of message without command.
     * @param command - MessageCommand instance.
     * @param ignore - Ignore inhibitors and other checks.
     */
    public async handleDirectCommand(
        message: Message,
        content: string,
        command: MessageCommand,
        ignore = false
    ): Promise<boolean | null> {
        let key;
        try {
            if (!ignore) {
                if (message.editedTimestamp && !command.editable) return false;
                if (await this.runPostTypeInhibitors(message, command))
                    return false;
            }
            const before = command.before(message);
            if (Util.isPromise(before)) await before;

            const args = await command.parse(message, content);
            if (Flag.is(args, 'cancel')) {
                this.emit(
                    CommandHandlerEvents.COMMAND_CANCELLED,
                    message,
                    command
                );
                return true;
            } else if (Flag.is(args, 'retry')) {
                this.emit(
                    CommandHandlerEvents.COMMAND_BREAKOUT,
                    message,
                    command,
                    args.message
                );
                return this.handle(args.message);
            } else if (Flag.is(args, 'continue')) {
                const continueCommand = this.modules.get(args.command)!;
                return this.handleDirectCommand(
                    message,
                    args.rest,
                    continueCommand,
                    args.ignore
                );
            }

            if (!ignore) {
                if (command.lock)
                    key = (command.lock as KeySupplier)(message, args);
                if (Util.isPromise(key)) key = await key;
                if (key) {
                    if (command.locker?.has(key)) {
                        key = null;
                        this.emit(
                            CommandHandlerEvents.COMMAND_LOCKED,
                            message,
                            command
                        );
                        return true;
                    }

                    command.locker?.add(key);
                }
            }

            await this.runCommand(message, command, args);
            return true;
        } catch (err: any) {
            this.emitError(err, message, command);
            return null;
        } finally {
            if (key) command.locker?.delete(key);
        }
    }

    /**
     * Handles regex and conditional messageCommands.
     * @param message - Message to handle.
     */
    public async handleRegexAndConditionalCommands(
        message: Message
    ): Promise<boolean> {
        const ran1 = await this.handleRegexCommands(message);
        const ran2 = await this.handleConditionalCommands(message);
        return ran1 || ran2;
    }

    /**
     * Handles regex messageCommands.
     * @param message - Message to handle.
     */
    public async handleRegexCommands(message: Message): Promise<boolean> {
        const hasRegexCommands = [];
        for (const command of this.modules.values()) {
            if (message.editedTimestamp ? command.editable : true) {
                const regex =
                    typeof command.regex === 'function'
                        ? command.regex(message)
                        : command.regex;
                if (regex) hasRegexCommands.push({ command, regex });
            }
        }

        const matchedCommands = [];
        for (const entry of hasRegexCommands) {
            const match = message.content.match(entry.regex);
            if (!match) continue;

            const matches = [];

            if (entry.regex.global) {
                let matched;

                while ((matched = entry.regex.exec(message.content)) != null) {
                    matches.push(matched);
                }
            }

            matchedCommands.push({ command: entry.command, match, matches });
        }

        if (!matchedCommands.length) {
            return false;
        }

        const promises = [];
        for (const { command, match, matches } of matchedCommands) {
            promises.push(
                (async () => {
                    try {
                        if (await this.runPostTypeInhibitors(message, command))
                            return;

                        const before = command.before(message);
                        if (Util.isPromise(before)) await before;

                        await this.runCommand(message, command, {
                            match,
                            matches,
                        });
                    } catch (err: any) {
                        this.emitError(err, message, command);
                    }
                })()
            );
        }

        await Promise.all(promises);
        return true;
    }

    /**
     * Handles conditional messageCommands.
     * @param message - Message to handle.
     */
    public async handleConditionalCommands(message: Message): Promise<boolean> {
        const trueCommands: MessageCommand[] = [];

        const filterPromises = [];
        for (const command of this.modules.values()) {
            if (message.editedTimestamp && !command.editable) continue;
            filterPromises.push(
                (async () => {
                    let cond = command.condition(message);
                    if (Util.isPromise(cond)) cond = await cond;
                    if (cond) trueCommands.push(command);
                })()
            );
        }

        await Promise.all(filterPromises);

        if (!trueCommands.length) {
            return false;
        }

        const promises = [];
        for (const command of trueCommands) {
            promises.push(
                (async () => {
                    try {
                        if (await this.runPostTypeInhibitors(message, command))
                            return;
                        const before = command.before(message);
                        if (Util.isPromise(before)) await before;
                        await this.runCommand(message, command, {});
                    } catch (err: any) {
                        this.emitError(err, message, command);
                    }
                })()
            );
        }

        await Promise.all(promises);
        return true;
    }

    /**
     * Runs inhibitors with the all type.
     * @param message - Message to handle.
     * @param slash - Whether or not the command should is a slash command.
     */
    public async runAllTypeInhibitors(
        message: Message | AkairoMessage,
        slash = false
    ): Promise<boolean> {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('all', message)
            : null;

        if (reason != null) {
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        } else if (!message.author) {
            this.emit(
                CommandHandlerEvents.MESSAGE_BLOCKED,
                message,
                BuiltInReasons.AUTHOR_NOT_FOUND
            );
        } else if (
            this.blockClient &&
            message.author.id === this.client.user?.id
        ) {
            this.emit(
                CommandHandlerEvents.MESSAGE_BLOCKED,
                message,
                BuiltInReasons.CLIENT
            );
        } else if (this.blockBots && message.author.bot) {
            this.emit(
                CommandHandlerEvents.MESSAGE_BLOCKED,
                message,
                BuiltInReasons.BOT
            );
        } else if (!slash && this.hasPrompt(message.channel!, message.author)) {
            this.emit(CommandHandlerEvents.IN_PROMPT, message);
        } else {
            return false;
        }

        return true;
    }

    /**
     * Runs inhibitors with the pre type.
     * @param message - Message to handle.
     */
    public async runPreTypeInhibitors(
        message: Message | AkairoMessage
    ): Promise<boolean> {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('pre', message)
            : null;

        if (reason != null) {
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        } else {
            return false;
        }

        return true;
    }

    /**
     * Runs inhibitors with the post type.
     * @param message - Message to handle.
     * @param command - MessageCommand to handle.
     * @param slash - Whether or not the command should is a slash command.
     */
    public async runPostTypeInhibitors(
        message: Message | AkairoMessage,
        command: MessageCommand,
        slash = false
    ): Promise<boolean> {
        const event = slash
            ? CommandHandlerEvents.SLASH_BLOCKED
            : CommandHandlerEvents.COMMAND_BLOCKED;

        if (!this.skipBuiltInPostInhibitors) {
            if (command.ownerOnly) {
                const isOwner = this.client.isOwner(message.author);
                if (!isOwner) {
                    this.emit(event, message, command, BuiltInReasons.OWNER);
                    return true;
                }
            }

            if (command.channel === 'guild' && !message.guild) {
                this.emit(event, message, command, BuiltInReasons.GUILD);
                return true;
            }

            if (command.channel === 'dm' && message.guild) {
                this.emit(event, message, command, BuiltInReasons.DM);
                return true;
            }
        }

        if (!this.skipBuiltInPostInhibitors) {
            if (await this.runPermissionChecks(message, command, slash)) {
                return true;
            }
        }

        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('post', message, command)
            : null;

        if (this.skipBuiltInPostInhibitors && reason == null) {
            if (await this.runPermissionChecks(message, command, slash)) {
                return true;
            }
        }

        if (reason != null) {
            this.emit(event, message, command, reason);
            return true;
        }

        if (this.runCooldowns(message, command)) {
            return true;
        }

        return false;
    }

    /**
     * Runs permission checks.
     * @param message - Message that called the command.
     * @param command - MessageCommand to cooldown.
     * @param slash - Whether the command is a slash command.
     */
    public async runPermissionChecks(
        message: Message | AkairoMessage,
        command: MessageCommand,
        slash = false
    ): Promise<boolean> {
        const event = slash
            ? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS
            : CommandHandlerEvents.MISSING_PERMISSIONS;
        if (command.clientPermissions) {
            if (typeof command.clientPermissions === 'function') {
                let missing = command.clientPermissions(message);
                if (Util.isPromise(missing)) missing = await missing;

                if (missing != null) {
                    this.emit(event, message, command, 'client', missing);
                    return true;
                }
            } else if (message.guild) {
                if (message.channel?.type === ChannelType.DM) return false;
                const missing = message.channel
                    ?.permissionsFor(message.guild.members.me!)
                    ?.missing(command.clientPermissions);
                if (missing?.length) {
                    this.emit(event, message, command, 'client', missing);
                    return true;
                }
            }
        }

        if (command.userPermissions) {
            const ignorer = command.ignorePermissions || this.ignorePermissions;
            const isIgnored = Array.isArray(ignorer)
                ? ignorer.includes(message.author.id)
                : typeof ignorer === 'function'
                ? ignorer(message, command)
                : message.author.id === ignorer;

            if (!isIgnored) {
                if (typeof command.userPermissions === 'function') {
                    let missing = command.userPermissions(message);
                    if (Util.isPromise(missing)) missing = await missing;

                    if (missing != null) {
                        this.emit(event, message, command, 'user', missing);
                        return true;
                    }
                } else if (message.guild) {
                    if (message.channel?.type === ChannelType.DM) return false;
                    const missing = message.channel
                        ?.permissionsFor(message.author)
                        ?.missing(command.userPermissions);
                    if (missing?.length) {
                        this.emit(event, message, command, 'user', missing);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Runs cooldowns and checks if a user is under cooldown.
     * @param message - Message that called the command.
     * @param command - MessageCommand to cooldown.
     */
    public runCooldowns(
        message: Message | AkairoMessage,
        command: MessageCommand
    ): boolean {
        const id = message.author?.id;
        const ignorer = command.ignoreCooldown || this.ignoreCooldown;
        const isIgnored = Array.isArray(ignorer)
            ? ignorer.includes(id)
            : typeof ignorer === 'function'
            ? ignorer(message, command)
            : id === ignorer;

        if (isIgnored) return false;

        const time =
            command.cooldown != null ? command.cooldown : this.defaultCooldown;
        if (!time) return false;

        const endTime = message.createdTimestamp + time;

        if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});

        if (!this.cooldowns.get(id)![command.id]) {
            this.cooldowns.get(id)![command.id] = {
                timer: setTimeout(() => {
                    if (this.cooldowns.get(id)![command.id]) {
                        clearTimeout(this.cooldowns.get(id)![command.id].timer);
                    }
                    this.cooldowns.get(id)![command.id] = null!;

                    if (!Object.keys(this.cooldowns.get(id)!).length) {
                        this.cooldowns.delete(id);
                    }
                }, time).unref(),
                end: endTime,
                uses: 0,
            };
        }

        const entry = this.cooldowns.get(id)![command.id];

        if (entry.uses >= command.ratelimit) {
            const end = this.cooldowns.get(id)![command.id].end;
            const diff = end - message.createdTimestamp;

            this.emit(CommandHandlerEvents.COOLDOWN, message, command, diff);
            return true;
        }

        entry.uses++;
        return false;
    }

    /**
     * Runs a command.
     * @param message - Message to handle.
     * @param command - MessageCommand to handle.
     * @param args - Arguments to use.
     */
    public async runCommand(
        message: Message,
        command: MessageCommand,
        args: any
    ): Promise<void> {
        if (!command || !message) {
            this.emit(CommandHandlerEvents.COMMAND_INVALID, message, command);
            return;
        }
        const typing =
            command.typing || this.typing
                ? setInterval(() => {
                      if (command.typing || this.typing)
                          message.channel.sendTyping();
                  }, 9000)
                : undefined;

        try {
            this.emit(
                CommandHandlerEvents.COMMAND_STARTED,
                message,
                command,
                args
            );
            const ret = await command.exec(message, args);
            this.emit(
                CommandHandlerEvents.COMMAND_FINISHED,
                message,
                command,
                args,
                ret
            );
        } finally {
            if (typing) clearInterval(typing);
        }
    }

    /**
     * Parses the command and its argument list.
     * @param message - Message that called the command.
     */
    public async parseCommand(
        message: Message | AkairoMessage
    ): Promise<ParsedComponentData> {
        const allowMention = await Util.intoCallable(this.prefix)(message);
        let prefixes = Util.intoArray(allowMention);
        if (allowMention) {
            const mentions = [
                `<@${this.client.user?.id}>`,
                `<@!${this.client.user?.id}>`,
            ];
            prefixes = [...mentions, ...prefixes];
        }

        prefixes.sort(Util.prefixCompare);
        return this.parseMultiplePrefixes(
            message,
            prefixes.map((p) => [p, null])
        );
    }

    /**
     * Parses the command and its argument list using prefix overwrites.
     * @param message - Message that called the command.
     */
    public async parseCommandOverwrittenPrefixes(
        message: Message | AkairoMessage
    ): Promise<ParsedComponentData> {
        if (!this.prefixes.size) {
            return {};
        }

        const promises = this.prefixes.map(async (cmds, provider) => {
            const prefixes = Util.intoArray(
                await Util.intoCallable(provider)(message)
            );
            return prefixes.map((p) => [p, cmds]);
        });

        const pairs = (await Promise.all(promises)).flat(1);
        pairs.sort(([a]: any, [b]: any) => Util.prefixCompare(a, b));
        return this.parseMultiplePrefixes(
            message,
            pairs as [string, Set<string>][]
        );
    }

    /**
     * Runs parseWithPrefix on multiple prefixes and returns the best parse.
     * @param message - Message to parse.
     * @param pairs - Pairs of prefix to associated messageCommands. That is, `[string, Set<string> | null][]`.
     */
    public parseMultiplePrefixes(
        message: Message | AkairoMessage,
        pairs: [string, Set<string> | null][]
    ): ParsedComponentData {
        const parses = pairs.map(([prefix, cmds]) =>
            this.parseWithPrefix(message, prefix, cmds)
        );
        const result = parses.find((parsed) => parsed.command);
        if (result) {
            return result;
        }

        const guess = parses.find((parsed) => parsed.prefix != null);
        if (guess) {
            return guess;
        }

        return {};
    }

    /**
     * Tries to parse a message with the given prefix and associated messageCommands.
     * Associated messageCommands refer to when a prefix is used in prefix overrides.
     * @param message - Message to parse.
     * @param prefix - Prefix to use.
     * @param associatedCommands - Associated messageCommands.
     */
    public parseWithPrefix(
        message: Message | AkairoMessage,
        prefix: string,
        associatedCommands: Set<string> | null = null
    ): ParsedComponentData {
        const lowerContent = message.content.toLowerCase();
        if (!lowerContent.startsWith(prefix.toLowerCase())) {
            return {};
        }

        const endOfPrefix =
            lowerContent.indexOf(prefix.toLowerCase()) + prefix.length;
        const startOfArgs =
            message.content.slice(endOfPrefix).search(/\S/) + prefix.length;
        const alias = message.content
            .slice(startOfArgs)
            .split(/\s{1,}|\n{1,}/)[0];
        const command = this.findCommand(alias);
        const content = message.content
            .slice(startOfArgs + alias.length + 1)
            .trim();
        const afterPrefix = message.content.slice(prefix.length).trim();

        if (!command) {
            return { prefix, alias, content, afterPrefix };
        }

        if (associatedCommands == null) {
            if (command.prefix != null) {
                return { prefix, alias, content, afterPrefix };
            }
        } else if (!associatedCommands.has(command.id)) {
            return { prefix, alias, content, afterPrefix };
        }

        return { command, prefix, alias, content, afterPrefix };
    }

    /**
     * Handles errors from the handling.
     * @param err - The error.
     * @param message - Message that called the command.
     * @param command - MessageCommand that errored.
     */
    public emitError(
        err: Error,
        message: Message | AkairoMessage,
        command?: MessageCommand | AkairoModule
    ): void {
        if (this.listenerCount(CommandHandlerEvents.ERROR)) {
            this.emit(CommandHandlerEvents.ERROR, err, message, command);
            return;
        }

        throw err;
    }

    /**
     * Sweep command util instances from cache and returns amount sweeped.
     * @param lifetime - Messages older than this will have their command util instance sweeped. This is in milliseconds and defaults to the `commandUtilLifetime` option.
     */
    public sweepCommandUtil(
        lifetime: number = this.commandUtilLifetime
    ): number {
        let count = 0;
        for (const commandUtil of this.commandUtils.values()) {
            const now = Date.now();
            const message = commandUtil.message;
            if (
                now -
                    ((message as Message).editedTimestamp ||
                        message.createdTimestamp) >
                lifetime
            ) {
                count++;
                this.commandUtils.delete(message.id);
            }
        }

        return count;
    }

    /**
     * Adds an ongoing prompt in order to prevent command usage in the channel.
     * @param channel - Channel to add to.
     * @param user - User to add.
     */
    public addPrompt(channel: TextBasedChannel, user: User): void {
        let users = this.prompts.get(channel.id);
        if (!users) this.prompts.set(channel.id, new Set());
        users = this.prompts.get(channel.id);
        users?.add(user.id);
    }

    /**
     * Removes an ongoing prompt.
     * @param channel - Channel to remove from.
     * @param user - User to remove.
     */
    public removePrompt(channel: TextBasedChannel, user: User): void {
        const users = this.prompts.get(channel.id);
        if (!users) return;
        users.delete(user.id);
        if (!users.size) this.prompts.delete(user.id);
    }

    /**
     * Checks if there is an ongoing prompt.
     * @param channel - Channel to check.
     * @param user - User to check.
     */
    public hasPrompt(channel: TextBasedChannel, user: User): boolean {
        const users = this.prompts.get(channel.id);
        if (!users) return false;
        return users.has(user.id);
    }

    /**
     * Finds a command by alias.
     * @param name - Alias to find with.
     */
    public findCommand(name: string): MessageCommand {
        return this.modules.get(this.aliases.get(name.toLowerCase())!)!;
    }

    /**
     * Set the inhibitor handler to use.
     * @param inhibitorHandler - The inhibitor handler.
     */
    public useInhibitorHandler(
        inhibitorHandler: InhibitorHandler
    ): MessageCommandHandler {
        this.inhibitorHandler = inhibitorHandler;
        this.resolver.inhibitorHandler = inhibitorHandler;

        return this;
    }

    /**
     * Set the listener handler to use.
     * @param listenerHandler - The listener handler.
     */
    public useListenerHandler(
        listenerHandler: ListenerHandler
    ): MessageCommandHandler {
        this.resolver.listenerHandler = listenerHandler;

        return this;
    }

    /**
     * Set the context menu command handler to use.
     * @param contextMenuCommandHandler - The context menu command handler.
     */
    public useContextMenuCommandHandler(
        contextMenuCommandHandler: ContextMenuCommandHandler
    ): MessageCommandHandler {
        this.resolver.contextMenuCommandHandler = contextMenuCommandHandler;

        return this;
    }
}

type Events = MessageCommandHandlerEventsType;

export default interface MessageCommandHandler extends AkairoHandler {
    /**
     * Loads a command.
     * @param thing - Module or path to module.
     */
    load(thing: string | MessageCommand): Promise<MessageCommand>;

    /**
     * Reads all messageCommands from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(
        directory?: string,
        filter?: LoadPredicate
    ): Promise<MessageCommandHandler>;

    /**
     * Removes a command.
     * @param id - ID of the command.
     */
    remove(id: string): MessageCommand;

    /**
     * Removes all messageCommands.
     */
    removeAll(): MessageCommandHandler;

    /**
     * Reloads a command.
     * @param id - ID of the command.
     */
    reload(id: string): Promise<MessageCommand>;

    /**
     * Reloads all messageCommands.
     */
    reloadAll(): Promise<MessageCommandHandler>;

    on<K extends keyof Events>(
        event: K,
        listener: (...args: Events[K]) => Awaitable<void>
    ): this;
    once<K extends keyof Events>(
        event: K,
        listener: (...args: Events[K]) => Awaitable<void>
    ): this;
}

export interface MessageCommandHandlerOptions extends AkairoHandlerOptions {
    /**
     * Regular expression to automatically make command aliases.
     * For example, using `/-/g` would mean that aliases containing `-` would be valid with and without it.
     * So, the alias `command-name` is valid as both `command-name` and `commandname`.
     */
    aliasReplacement?: RegExp;

    /**
     * Whether or not to allow mentions to the client user as a prefix.
     */
    allowMention?: boolean | MentionPrefixPredicate;

    /**
     * Default argument options.
     * @default {}
     */
    argumentDefaults?: DefaultArgumentOptions;

    /**
     * Whether or not to block bots.
     * @default true
     */
    blockBots?: boolean;

    /**
     * Whether or not to block self.
     * @default true
     */
    blockClient?: boolean;

    /**
     * Whether or not to assign `message.util`.
     */
    commandUtil?: boolean;

    /**
     * Milliseconds a message should exist for before its command util instance is marked for removal.
     * If `0`, MessageCommandUtil instances will never be removed and will cause memory to increase indefinitely.
     * @default 300_000 // 5 minutes
     */
    commandUtilLifetime?: number;

    /**
     * Time interval in milliseconds for sweeping command util instances.
     * If `0`, MessageCommandUtil instances will never be removed and will cause memory to increase indefinitely.
     * @default 300_000 // 5 minutes
     */
    commandUtilSweepInterval?: number;

    /**
     * Default cooldown for messageCommands.
     * @default 0
     */
    defaultCooldown?: number;

    /**
     * Whether or not members are fetched on each message author from a guild.
     * @default false
     */
    fetchMembers?: boolean;

    /**
     * Whether or not to handle edited messages using MessageCommandUtil.
     * @default false
     */
    handleEdits?: boolean;

    /**
     * ID of user(s) to ignore cooldown or a function to ignore. Defaults to the client owner(s).
     * @default client.ownerID
     */
    ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     * @default []
     */
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

    /**
     * The prefix(es) for command parsing.
     * @default "!"
     */
    prefix?: string | string[] | PrefixSupplier;

    /**
     * Whether or not to store messages in MessageCommandUtil.
     * @default false
     */
    storeMessages?: boolean;

    /**
     * Show "BotName is typing" information message on the text channels when a command is running.
     * @default false
     */
    typing?: boolean;

    /**
     * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
     * @default false
     */
    skipBuiltInPostInhibitors?: boolean;
}

/**
 * Data for managing cooldowns.
 */
export interface CooldownData {
    /**
     * When the cooldown ends.
     */
    end: number;

    /**
     * Timeout object.
     */
    timer: NodeJS.Timer;

    /**
     * Number of times the command has been used.
     */
    uses: number;
}

/**
 * Various parsed components of the message.
 */
export interface ParsedComponentData {
    /**
     * The content to the right of the prefix.
     */
    afterPrefix?: string;

    /**
     * The alias used.
     */
    alias?: string;

    /**
     * The command used.
     */
    command?: MessageCommand;

    /**
     * The content to the right of the alias.
     */
    content?: string;

    /**
     * The prefix used.
     */
    prefix?: string;
}

/**
 * A function that returns whether this message should be ignored for a certain check.
 * @param message - Message to check.
 * @param command - MessageCommand to check.
 */
export type IgnoreCheckPredicate = (
    message: Message | AkairoMessage,
    command: MessageCommand
) => boolean;

/**
 * A function that returns whether mentions can be used as a prefix.
 * @param message - Message to option for.
 */
export type MentionPrefixPredicate = (
    message: Message
) => boolean | Promise<boolean>;

/**
 * A function that returns the prefix(es) to use.
 * @param message - Message to get prefix for.
 */
export type PrefixSupplier = (
    message: Message
) => string | string[] | Promise<string | string[]>;

/**
 * @typedef {CommandInteractionOptionResolver} VSCodePleaseStopRemovingMyImports
 * @internal
 */
