"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoMessage_1 = __importDefault(require("../../util/AkairoMessage"));
const Constants_1 = require("../../util/Constants");
const Util_1 = __importDefault(require("../../util/Util"));
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const TypeResolver_1 = __importDefault(require("../messageCommands/arguments/TypeResolver"));
const SlashCommand_1 = __importDefault(require("./SlashCommand"));
class SlashCommandHandler extends AkairoHandler_1.default {
    constructor(client, options) {
        const { directory, classToHandle = SlashCommand_1.default, extensions = ['.js', '.ts'], automateCategories, loadFilter, blockClient = true, blockBots = true, ignorePermissions = [], skipBuiltInPostInhibitors = false, } = options !== null && options !== void 0 ? options : {};
        if (!(classToHandle.prototype instanceof SlashCommand_1.default ||
            classToHandle === SlashCommand_1.default)) {
            throw new AkairoError_1.default('INVALID_CLASS_TO_HANDLE', classToHandle.name, SlashCommand_1.default.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter,
        });
        this.resolver = new TypeResolver_1.default(this);
        this.names = new discord_js_1.Collection();
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
                if (i.type === discord_js_1.InteractionType.ApplicationCommandAutocomplete)
                    this.handleAutocomplete(i);
            });
        });
    }
    register(command, filepath) {
        super.register(command, filepath);
        const conflict = this.names.get(command.name.toLowerCase());
        if (conflict)
            throw new AkairoError_1.default('ALIAS_CONFLICT', command.name, command.id, conflict);
        const name = command.name.toLowerCase();
        this.names.set(name, command.id);
    }
    deregister(command) {
        const name = command.name.toLowerCase();
        this.names.delete(name);
        super.deregister(command);
    }
    handleSlash(interaction) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let commandName = interaction.commandName;
            if (interaction.options.getSubcommandGroup(false) !== null)
                commandName += ` ${interaction.options.getSubcommandGroup()}`;
            if (interaction.options.getSubcommand(false) !== null)
                commandName += ` ${interaction.options.getSubcommand()}`;
            const commandModule = this.findCommand(commandName);
            if (!commandModule) {
                this.emit(Constants_1.SlashCommandHandlerEvents.SLASH_COMMAND_NOT_FOUND, interaction);
                return false;
            }
            const message = new AkairoMessage_1.default(this.client, interaction);
            try {
                if (yield this.runAllTypeInhibitors(message)) {
                    return false;
                }
                if (yield this.runPreTypeInhibitors(message)) {
                    return false;
                }
                if (yield this.runPostTypeInhibitors(message, commandModule)) {
                    return false;
                }
                const convertedOptions = {};
                if (interaction.options['_group'])
                    convertedOptions['subcommandGroup'] = interaction.options['_group'];
                if (interaction.options['_subcommand'])
                    convertedOptions['subcommand'] = interaction.options['_subcommand'];
                for (const option of interaction.options['_hoistedOptions']) {
                    if ([
                        discord_js_1.ApplicationCommandOptionType.Subcommand,
                        discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
                    ].includes(option.type))
                        continue;
                    convertedOptions[option.name] = interaction.options[Util_1.default.snakeToCamelCase(`GET_${discord_js_1.ApplicationCommandOptionType[option.type].toUpperCase()}`)](option.name, false);
                }
                // Make options that are not found to be null so that it matches the behavior normal messageCommands.
                (() => {
                    var _a, _b, _c;
                    if (convertedOptions.subcommand ||
                        convertedOptions.subcommandGroup) {
                        const usedSubcommandOrGroup = (_a = commandModule.slashOptions) === null || _a === void 0 ? void 0 : _a.find((o) => o.name === convertedOptions.subcommand &&
                            [
                                discord_js_1.ApplicationCommandOptionType.Subcommand,
                                'SUB_COMMAND',
                                discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
                                'SUB_COMMAND_GROUP',
                            ].includes(o.type));
                        if (!usedSubcommandOrGroup) {
                            this.client.emit('AkairoDebug', `Unable to find subcommand`);
                            return;
                        }
                        if ([
                            discord_js_1.ApplicationCommandOptionType.Subcommand,
                            'SUB_COMMAND',
                        ].includes(usedSubcommandOrGroup.type)) {
                            if (!usedSubcommandOrGroup.options) {
                                this.client.emit('AkairoDebug', `Unable to find subcommand options`);
                                return;
                            }
                            handleOptions(usedSubcommandOrGroup.options);
                        }
                        else if ([
                            discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
                            'SUB_COMMAND_GROUP',
                        ].includes(usedSubcommandOrGroup.type)) {
                            const usedSubCommand = (_b = usedSubcommandOrGroup.options) === null || _b === void 0 ? void 0 : _b.find((subcommand) => subcommand.name === convertedOptions.subcommand);
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
                        handleOptions(((_c = commandModule.slashOptions) !== null && _c !== void 0 ? _c : []));
                    }
                    function handleOptions(options) {
                        for (const option of options) {
                            if (!Reflect.has(convertedOptions, option.name) ||
                                convertedOptions[option.name] === undefined) {
                                switch (option.type) {
                                    case discord_js_1.ApplicationCommandOptionType.Boolean:
                                        convertedOptions[option.name] = false;
                                        break;
                                    case discord_js_1.ApplicationCommandOptionType.Channel:
                                    case discord_js_1.ApplicationCommandOptionType.Integer:
                                    case discord_js_1.ApplicationCommandOptionType.Mentionable:
                                    case discord_js_1.ApplicationCommandOptionType.Number:
                                    case discord_js_1.ApplicationCommandOptionType.Role:
                                    case discord_js_1.ApplicationCommandOptionType.String:
                                    case discord_js_1.ApplicationCommandOptionType.User:
                                    case discord_js_1.ApplicationCommandOptionType.Attachment:
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
                    if (Util_1.default.isPromise(key))
                        key = yield key;
                    if (key) {
                        if ((_a = commandModule.locker) === null || _a === void 0 ? void 0 : _a.has(key)) {
                            key = null;
                            this.emit(Constants_1.SlashCommandHandlerEvents.SLASH_COMMAND_LOCKED, message, commandModule);
                            return true;
                        }
                        (_b = commandModule.locker) === null || _b === void 0 ? void 0 : _b.add(key);
                    }
                }
                catch (err) {
                    this.emitError(err, message, commandModule);
                }
                finally {
                    if (key)
                        (_c = commandModule.locker) === null || _c === void 0 ? void 0 : _c.delete(key);
                }
                try {
                    this.emit(Constants_1.SlashCommandHandlerEvents.SLASH_COMMAND_STARTED, message, commandModule, convertedOptions);
                    const ret = yield commandModule.exec(interaction, message, convertedOptions);
                    this.emit(Constants_1.SlashCommandHandlerEvents.SLASH_COMMAND_FINISHED, message, commandModule, convertedOptions, ret);
                    return true;
                }
                catch (err) {
                    this.emit(Constants_1.SlashCommandHandlerEvents.ERROR, err, message, commandModule);
                    return false;
                }
            }
            catch (err) {
                this.emitError(err, message, commandModule);
                return null;
            }
        });
    }
    handleAutocomplete(interaction) {
        let commandName = interaction.commandName;
        if (interaction.options.getSubcommandGroup(false) !== null)
            commandName += ` ${interaction.options.getSubcommandGroup()}`;
        if (interaction.options.getSubcommand(false) !== null)
            commandName += ` ${interaction.options.getSubcommand()}`;
        const commandModule = this.findCommand(commandName);
        if (!commandModule) {
            this.emit(Constants_1.SlashCommandHandlerEvents.SLASH_COMMAND_NOT_FOUND, interaction);
            return;
        }
        this.client.emit('AkairoDebug', `Autocomplete started for ${interaction.commandName}`);
        commandModule.autocomplete(interaction);
    }
    runAllTypeInhibitors(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const reason = this.inhibitorHandler
                ? yield this.inhibitorHandler.test('all', message)
                : null;
            if (reason != null) {
                this.emit(Constants_1.SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
            }
            else if (!message.author) {
                this.emit(Constants_1.SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, Constants_1.BuiltInReasons.AUTHOR_NOT_FOUND);
            }
            else if (this.blockClient &&
                message.author.id === ((_a = this.client.user) === null || _a === void 0 ? void 0 : _a.id)) {
                this.emit(Constants_1.SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, Constants_1.BuiltInReasons.CLIENT);
            }
            else if (this.blockBots && message.author.bot) {
                this.emit(Constants_1.SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, Constants_1.BuiltInReasons.BOT);
            }
            else {
                return false;
            }
            return true;
        });
    }
    runPreTypeInhibitors(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const reason = this.inhibitorHandler
                ? yield this.inhibitorHandler.test('pre', message)
                : null;
            if (reason != null) {
                this.emit(Constants_1.SlashCommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
            }
            else {
                return false;
            }
            return true;
        });
    }
    runPostTypeInhibitors(message, command) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = Constants_1.SlashCommandHandlerEvents.SLASH_COMMAND_BLOCKED;
            if (!this.skipBuiltInPostInhibitors) {
                if (command.ownerOnly) {
                    const isOwner = this.client.isOwner(message.author);
                    if (!isOwner) {
                        this.emit(event, message, command, Constants_1.BuiltInReasons.OWNER);
                        return true;
                    }
                }
                if (command.channel === 'guild' && !message.guild) {
                    this.emit(event, message, command, Constants_1.BuiltInReasons.GUILD);
                    return true;
                }
                if (command.channel === 'dm' && message.guild) {
                    this.emit(event, message, command, Constants_1.BuiltInReasons.DM);
                    return true;
                }
            }
            if (!this.skipBuiltInPostInhibitors) {
                if (yield this.runPermissionChecks(message, command)) {
                    return true;
                }
            }
            const reason = this.inhibitorHandler
                ? yield this.inhibitorHandler.test('post', message, command)
                : null;
            if (this.skipBuiltInPostInhibitors && reason == null) {
                if (yield this.runPermissionChecks(message, command)) {
                    return true;
                }
            }
            if (reason != null) {
                this.emit(event, message, command, reason);
                return true;
            }
            return false;
        });
    }
    runPermissionChecks(message, command) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const event = Constants_1.SlashCommandHandlerEvents.SLASH_MISSING_PERMISSIONS;
            if (command.clientPermissions) {
                if (typeof command.clientPermissions === 'function') {
                    let missing = command.clientPermissions(message);
                    if (Util_1.default.isPromise(missing))
                        missing = yield missing;
                    if (missing != null) {
                        this.emit(event, message, command, 'client', missing);
                        return true;
                    }
                }
                else if (message.guild) {
                    if (((_a = message.channel) === null || _a === void 0 ? void 0 : _a.type) === discord_js_1.ChannelType.DM)
                        return false;
                    const missing = (_c = (_b = message.channel) === null || _b === void 0 ? void 0 : _b.permissionsFor(message.guild.members.me)) === null || _c === void 0 ? void 0 : _c.missing(command.clientPermissions);
                    if (missing === null || missing === void 0 ? void 0 : missing.length) {
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
                        if (Util_1.default.isPromise(missing))
                            missing = yield missing;
                        if (missing != null) {
                            this.emit(event, message, command, 'user', missing);
                            return true;
                        }
                    }
                    else if (message.guild) {
                        if (((_d = message.channel) === null || _d === void 0 ? void 0 : _d.type) === discord_js_1.ChannelType.DM)
                            return false;
                        const missing = (_f = (_e = message.channel) === null || _e === void 0 ? void 0 : _e.permissionsFor(message.author)) === null || _f === void 0 ? void 0 : _f.missing(command.userPermissions);
                        if (missing === null || missing === void 0 ? void 0 : missing.length) {
                            this.emit(event, message, command, 'user', missing);
                            return true;
                        }
                    }
                }
            }
            return false;
        });
    }
    emitError(err, message, command) {
        if (this.listenerCount(Constants_1.SlashCommandHandlerEvents.ERROR)) {
            this.emit(Constants_1.SlashCommandHandlerEvents.ERROR, err, message, command);
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
exports.default = SlashCommandHandler;
//# sourceMappingURL=SlashCommandHandler.js.map