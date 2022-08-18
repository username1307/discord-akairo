import { ApplicationCommandOptionType, ChannelType, Collection, InteractionType, } from 'discord.js';
import AkairoError from '../../util/AkairoError';
import AkairoMessage from '../../util/AkairoMessage';
import { BuiltInReasons, SlashCommandHandlerEvents, } from '../../util/Constants';
import Util from '../../util/Util';
import AkairoHandler from '../AkairoHandler';
import TypeResolver from '../messageCommands/arguments/TypeResolver';
import SlashCommand from './SlashCommand';
export default class SlashCommandHandler extends AkairoHandler {
    constructor(client, options) {
        const { directory, classToHandle = SlashCommand, extensions = ['.js', '.ts'], automateCategories, loadFilter, blockClient = true, blockBots = true, ignorePermissions = [], skipBuiltInPostInhibitors = false, } = options ?? {};
        if (!(classToHandle.prototype instanceof SlashCommand ||
            classToHandle === SlashCommand)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, SlashCommand.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter,
        });
        this.resolver = new TypeResolver(this);
        this.names = new Collection();
        this.blockClient = Boolean(blockClient);
        this.blockBots = Boolean(blockBots);
        this.ignorePermissions =
            typeof ignorePermissions === 'function'
                ? ignorePermissions.bind(this)
                : ignorePermissions;
        this.inhibitorHandler = null;
        this.skipBuiltInPostInhibitors = Boolean(skipBuiltInPostInhibitors);
        this.setup();
    }
    setup() {
        this.client.once('ready', () => {
            this.client.on('interactionCreate', (i) => {
                if (i.isChatInputCommand())
                    void this.handleSlash(i);
                if (i.type === InteractionType.ApplicationCommandAutocomplete)
                    this.handleAutocomplete(i);
            });
        });
    }
    register(command, filepath) {
        super.register(command, filepath);
        const conflict = this.names.get(command.name.toLowerCase());
        if (conflict)
            throw new AkairoError('ALIAS_CONFLICT', command.name, command.id, conflict);
        const name = command.name.toLowerCase();
        this.names.set(name, command.id);
    }
    deregister(command) {
        const name = command.name.toLowerCase();
        this.names.delete(name);
        super.deregister(command);
    }
    async handleSlash(interaction) {
        let commandName = interaction.commandName;
        if (interaction.options.getSubcommandGroup(false) !== null)
            commandName += ` ${interaction.options.getSubcommandGroup()}`;
        if (interaction.options.getSubcommand(false) !== null)
            commandName += ` ${interaction.options.getSubcommand()}`;
        const commandModule = this.findCommand(commandName);
        if (!commandModule) {
            this.emit(SlashCommandHandlerEvents.SLASH_COMMAND_NOT_FOUND, interaction);
            return false;
        }
        const message = new AkairoMessage(this.client, interaction);
        try {
            if (await this.runAllTypeInhibitors(message)) {
                return false;
            }
            if (await this.runPreTypeInhibitors(message)) {
                return false;
            }
            if (await this.runPostTypeInhibitors(message, commandModule)) {
                return false;
            }
            const convertedOptions = {};
            if (interaction.options['_group'])
                convertedOptions['subcommandGroup'] = interaction.options['_group'];
            if (interaction.options['_subcommand'])
                convertedOptions['subcommand'] = interaction.options['_subcommand'];
            for (const option of interaction.options['_hoistedOptions']) {
                if ([
                    ApplicationCommandOptionType.Subcommand,
                    ApplicationCommandOptionType.SubcommandGroup,
                ].includes(option.type))
                    continue;
                convertedOptions[option.name] = interaction.options[Util.snakeToCamelCase(`GET_${ApplicationCommandOptionType[option.type].toUpperCase()}`)](option.name, false);
            }
            // Make options that are not found to be null so that it matches the behavior normal messageCommands.
            (() => {
                if (convertedOptions.subcommand ||
                    convertedOptions.subcommandGroup) {
                    const usedSubcommandOrGroup = commandModule.slashOptions?.find((o) => o.name === convertedOptions.subcommand &&
                        [
                            ApplicationCommandOptionType.Subcommand,
                            'SUB_COMMAND',
                            ApplicationCommandOptionType.SubcommandGroup,
                            'SUB_COMMAND_GROUP',
                        ].includes(o.type));
                    if (!usedSubcommandOrGroup) {
                        this.client.emit('AkairoDebug', `Unable to find subcommand`);
                        return;
                    }
                    if ([
                        ApplicationCommandOptionType.Subcommand,
                        'SUB_COMMAND',
                    ].includes(usedSubcommandOrGroup.type)) {
                        if (!usedSubcommandOrGroup.options) {
                            this.client.emit('AkairoDebug', `Unable to find subcommand options`);
                            return;
                        }
                        handleOptions(usedSubcommandOrGroup.options);
                    }
                    else if ([
                        ApplicationCommandOptionType.SubcommandGroup,
                        'SUB_COMMAND_GROUP',
                    ].includes(usedSubcommandOrGroup.type)) {
                        const usedSubCommand = usedSubcommandOrGroup.options?.find((subcommand) => subcommand.name === convertedOptions.subcommand);
                        if (!usedSubCommand) {
                            this.client.emit('AkairoDebug', `Unable to find subcommand`);
                            return;
                        }
                        else if (!usedSubCommand.options) {
                            this.client.emit('AkairoDebug', `Unable to find subcommand options`);
                            return;
                        }
                        handleOptions(usedSubCommand.options);
                    }
                    else {
                        throw new Error(`Unexpected command type ${usedSubcommandOrGroup.type}`);
                    }
                }
                else {
                    handleOptions((commandModule.slashOptions ??
                        []));
                }
                function handleOptions(options) {
                    for (const option of options) {
                        if (!Reflect.has(convertedOptions, option.name) ||
                            convertedOptions[option.name] === undefined) {
                            switch (option.type) {
                                case ApplicationCommandOptionType.Boolean:
                                    convertedOptions[option.name] = false;
                                    break;
                                case ApplicationCommandOptionType.Channel:
                                case ApplicationCommandOptionType.Integer:
                                case ApplicationCommandOptionType.Mentionable:
                                case ApplicationCommandOptionType.Number:
                                case ApplicationCommandOptionType.Role:
                                case ApplicationCommandOptionType.String:
                                case ApplicationCommandOptionType.User:
                                case ApplicationCommandOptionType.Attachment:
                                default:
                                    convertedOptions[option.name] = null;
                                    break;
                            }
                        }
                    }
                }
            })();
            let key;
            try {
                if (commandModule.lock)
                    key = commandModule.lock(message, convertedOptions);
                if (Util.isPromise(key))
                    key = await key;
                if (key) {
                    if (commandModule.locker?.has(key)) {
                        key = null;
                        this.emit(SlashCommandHandlerEvents.SLASH_COMMAND_LOCKED, message, commandModule);
                        return true;
                    }
                    commandModule.locker?.add(key);
                }
            }
            catch (err) {
                this.emitError(err, message, commandModule);
            }
            finally {
                if (key)
                    commandModule.locker?.delete(key);
            }
            try {
                this.emit(SlashCommandHandlerEvents.SLASH_COMMAND_STARTED, message, commandModule, convertedOptions);
                const ret = await commandModule.exec(interaction, message, convertedOptions);
                this.emit(SlashCommandHandlerEvents.SLASH_COMMAND_FINISHED, message, commandModule, convertedOptions, ret);
                return true;
            }
            catch (err) {
                this.emit(SlashCommandHandlerEvents.ERROR, err, message, commandModule);
                return false;
            }
        }
        catch (err) {
            this.emitError(err, message, commandModule);
            return null;
        }
    }
    handleAutocomplete(interaction) {
        let commandName = interaction.commandName;
        if (interaction.options.getSubcommandGroup(false) !== null)
            commandName += ` ${interaction.options.getSubcommandGroup()}`;
        if (interaction.options.getSubcommand(false) !== null)
            commandName += ` ${interaction.options.getSubcommand()}`;
        const commandModule = this.findCommand(commandName);
        if (!commandModule) {
            this.emit(SlashCommandHandlerEvents.SLASH_COMMAND_NOT_FOUND, interaction);
            return;
        }
        this.client.emit('AkairoDebug', `Autocomplete started for ${interaction.commandName}`);
        commandModule.autocomplete(interaction);
    }
    async runAllTypeInhibitors(message) {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('all', message)
            : null;
        if (reason != null) {
            this.emit(SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        }
        else if (!message.author) {
            this.emit(SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.AUTHOR_NOT_FOUND);
        }
        else if (this.blockClient &&
            message.author.id === this.client.user?.id) {
            this.emit(SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.CLIENT);
        }
        else if (this.blockBots && message.author.bot) {
            this.emit(SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.BOT);
        }
        else {
            return false;
        }
        return true;
    }
    async runPreTypeInhibitors(message) {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('pre', message)
            : null;
        if (reason != null) {
            this.emit(SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        }
        else {
            return false;
        }
        return true;
    }
    async runPostTypeInhibitors(message, command) {
        const event = SlashCommandHandlerEvents.SLASH_COMMAND_BLOCKED;
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
            if (await this.runPermissionChecks(message, command)) {
                return true;
            }
        }
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('post', message, command)
            : null;
        if (this.skipBuiltInPostInhibitors && reason == null) {
            if (await this.runPermissionChecks(message, command)) {
                return true;
            }
        }
        if (reason != null) {
            this.emit(event, message, command, reason);
            return true;
        }
        return false;
    }
    async runPermissionChecks(message, command) {
        const event = SlashCommandHandlerEvents.SLASH_MISSING_PERMISSIONS;
        if (command.clientPermissions) {
            if (typeof command.clientPermissions === 'function') {
                let missing = command.clientPermissions(message);
                if (Util.isPromise(missing))
                    missing = await missing;
                if (missing != null) {
                    this.emit(event, message, command, 'client', missing);
                    return true;
                }
            }
            else if (message.guild) {
                if (message.channel?.type === ChannelType.DM)
                    return false;
                const missing = message.channel
                    ?.permissionsFor(message.guild.members.me)
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
                    if (Util.isPromise(missing))
                        missing = await missing;
                    if (missing != null) {
                        this.emit(event, message, command, 'user', missing);
                        return true;
                    }
                }
                else if (message.guild) {
                    if (message.channel?.type === ChannelType.DM)
                        return false;
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
    emitError(err, message, command) {
        if (this.listenerCount(SlashCommandHandlerEvents.ERROR)) {
            this.emit(SlashCommandHandlerEvents.ERROR, err, message, command);
            return;
        }
        throw err;
    }
    findCommand(name) {
        return this.modules.get(this.names.get(name.toLowerCase()));
    }
    useInhibitorHandler(inhibitorHandler) {
        this.inhibitorHandler = inhibitorHandler;
        this.resolver.inhibitorHandler = inhibitorHandler;
        return this;
    }
    useListenerHandler(listenerHandler) {
        this.resolver.listenerHandler = listenerHandler;
        return this;
    }
    useContextMenuCommandHandler(contextMenuCommandHandler) {
        this.resolver.contextMenuCommandHandler = contextMenuCommandHandler;
        return this;
    }
}
//# sourceMappingURL=SlashCommandHandler.js.map