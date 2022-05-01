const AkairoError = require('../../util/AkairoError');
const AkairoHandler = require('../AkairoHandler');
const AkairoMessage = require('../../util/AkairoMessage');
const { BuiltInReasons, CommandHandlerEvents } = require('../../util/Constants');
// eslint-disable-next-line no-unused-vars
const { CommandInteraction, AutocompleteInteraction, Snowflake, Collection } = require('discord.js');
const { isPromise } = require('../../util/Util');
const TypeResolver = require('../commands/arguments/TypeResolver');
const SlashCommand = require('./SlashCommand');

class SlashCommandHandler extends AkairoHandler {
    constructor(client, {
        directory,
        classToHandle = SlashCommand,
        extensions = ['.js', '.ts'],
        automateCategories,
        loadFilter,
        ignorePermissions = []
    } = {}) {
        if (!(classToHandle.prototype instanceof SlashCommand || classToHandle === SlashCommand)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, SlashCommand.name);
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });

        /**
         * The type resolver.
         * @type {TypeResolver}
         */
        this.resolver = new TypeResolver(this);

        /**
         * Collecion of command names.
         * @type {Collection<string, string>}
         */
        this.names = new Collection();

        /**
         * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
         * @type {Snowflake|Snowflake[]|IgnoreCheckPredicate}
         */
        this.ignorePermissions = typeof ignorePermissions === 'function' ? ignorePermissions.bind(this) : ignorePermissions;

        /**
         * Inhibitor handler to use.
         * @type {?InhibitorHandler}
         */
        this.inhibitorHandler = null;

        /**
         * Directory to commands.
         * @name CommandHandler#directory
         * @type {string}
         */

        /**
         * Commands loaded, mapped by ID to Command.
         * @name CommandHandler#modules
         * @type {Collection<string, Command>}
         */

        this.setup();
    }

    setup() {
        this.client.once('ready', () => {
            this.client.on('interactionCreate', async i => {
                if (i.isCommand()) {
                    await this.handle(i);
                }
                if (i.isAutocomplete()) {
                    this.handleAutocomplete(i);
                }
            });
        });
    }

    /**
     * Registers a module.
     * @param {SlashCommand} command - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    register(command, filepath) {
        super.register(command, filepath);
        const name = command.name.toLowerCase();

        const conflict = this.names.get(name);
        if (conflict) {
            throw new AkairoError('ALIAS_CONFLICT', command.name, command.id, conflict);
        }
        this.names.set(name, command.id);
    }

    /**
     * Deregisters a module.
     * @param {SlashCommand} command - Module to use.
     * @returns {void}
     */
    deregister(command) {
        const name = command.name.toLowerCase();
        this.names.delete(name);
        super.deregister(command);
    }

    /**
     * Handles an interaction.
     * @param {CommandInteraction} interaction - Interaction to handle.
     * @returns {Promise<?boolean>}
     */
    async handle(interaction) {
        const commandName = this.getCommandName(interaction);
        const commandModule = this.findCommand(commandName);

        if (!commandModule) {
            this.emit(CommandHandlerEvents.COMMAND_NOT_FOUND, interaction);
            return false;
        }

        const message = new AkairoMessage(this.client, interaction, commandName);

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

            try {
                this.emit(
                    CommandHandlerEvents.COMMAND_STARTED,
                    message,
                    commandModule,
                );
                const ret = await commandModule.exec(
                    interaction,
                    message,
                );
                this.emit(
                    CommandHandlerEvents.COMMAND_FINISHED,
                    message,
                    commandModule,
                    ret
                );
                return true;
            } catch (err) {
                this.emit(CommandHandlerEvents.ERROR, err, message, commandModule);
                return false;
            }
        } catch (err) {
            this.emitError(err, message, commandModule);
            return null;
        }
    }

    /**
     * Handles autocomplete.
     * @param {AutocompleteInteraction} interaction - Interaction to handle.
     * @returns {void}
     */
    handleAutocomplete(interaction) {
        const commandName = this.getCommandName(interaction);
        const commandModule = this.findCommand(commandName);

        if (!commandModule) {
            this.emit(CommandHandlerEvents.COMMAND_NOT_FOUND, interaction);
            return;
        }

        commandModule.autocomplete(interaction);
    }

    /**
     * Runs inhibitors with the all type.
     * @param {AkairoMessage} message - Message to handle.
     * @returns {Promise<boolean>}
     */
    async runAllTypeInhibitors(message) {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('all', message)
            : null;

        if (reason != null) {
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        } else {
            return false;
        }

        return true;
    }

    /**
     * Runs inhibitors with the pre type.
     * @param {AkairoMessage} message - Message to handle.
     * @returns {Promise<boolean>}
     */
    async runPreTypeInhibitors(message) {
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
     * @param {AkairoMessage} message - Message to handle.
     * @param {SlashCommand} command - Command to handle.
     * @returns {Promise<boolean>}
     */
    async runPostTypeInhibitors(message, command) {
        const event = CommandHandlerEvents.COMMAND_BLOCKED;

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

        if (await this.runPermissionChecks(message, command)) {
            return true;
        }

        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('post', message, command)
            : null;

        if (await this.runPermissionChecks(message, command)) {
            return true;
        }

        if (reason != null) {
            this.emit(event, message, command, reason);
            return true;
        }

        return false;
    }

    /**
     * Runs permission checks.
     * @param {AkairoMessage} message - Message that called the command.
     * @param {SlashCommand} command - Command to cooldown.
     * @returns {Promise<boolean>}
     */
    async runPermissionChecks(message, command) {
        if (command.clientPermissions) {
            if (typeof command.clientPermissions === 'function') {
                let missing = command.clientPermissions(message);
                if (isPromise(missing)) missing = await missing;

                if (missing != null) {
                    this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, command, 'client', missing);
                    return true;
                }
            } else if (message.guild) {
                const missing = message.channel.permissionsFor(this.client.user).missing(command.clientPermissions);
                if (missing.length) {
                    this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, command, 'client', missing);
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
                    if (isPromise(missing)) missing = await missing;

                    if (missing != null) {
                        this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, command, 'user', missing);
                        return true;
                    }
                } else if (message.guild) {
                    const missing = message.channel.permissionsFor(message.author).missing(command.userPermissions);
                    if (missing.length) {
                        this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, command, 'user', missing);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Handles errors from the handling.
     * @param {Error} err - The error.
     * @param {AkairoMessage} message - Message that called the command.
     * @param {SlashCommand} [command] - Command that errored.
     * @returns {void}
     */
    emitError(err, message, command) {
        if (this.listenerCount(CommandHandlerEvents.ERROR)) {
            this.emit(CommandHandlerEvents.ERROR, err, message, command);
            return;
        }

        throw err;
    }

    /**
     * Finds a command
     * @param {string} name - Name to find with
     * @returns {SlashCommand}
     */
    findCommand(name) {
        return this.modules.get(this.names.get(name.toLowerCase()));
    }

    /** Format command name
     * @param {CommandInteraction | AutocompleteInteraction } interaction - interaction triggered
     * @returns {string}
     */
    getCommandName(interaction) {
        let commandName = interaction.commandName;
        if (interaction.options.getSubcommandGroup(false) !== null) {
            commandName += ` ${interaction.options.getSubcommandGroup()}`;
        }
        if (interaction.options.getSubcommand(false) !== null) {
            commandName += ` ${interaction.options.getSubcommand()}`;
        }
        return commandName;
    }

    /**
     * Set the inhibitor handler to use.
     * @param {InhibitorHandler} inhibitorHandler - The inhibitor handler.
     * @returns {SlashCommandHandler}
     */
    useInhibitorHandler(inhibitorHandler) {
        this.inhibitorHandler = inhibitorHandler;
        this.resolver.inhibitorHandler = inhibitorHandler;

        return this;
    }

    /**
     * Set the listener handler to use.
     * @param {ListenerHandler} listenerHandler - The listener handler.
     * @returns {SlashCommandHandler}
     */
    useListenerHandler(listenerHandler) {
        this.resolver.listenerHandler = listenerHandler;

        return this;
    }

    /**
     * Loads a slash command.
     * @method
     * @name SlashCommandHandler#load
     * @param {string|SlashCommand} thing - Module or path to module.
     * @returns {SlashCommand}
     */

    /**
     * Reads all slash commands from the directory and loads them.
     * @method
     * @name SlashCommandHandler#loadAll
     * @param {string} [directory] - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
     * @returns {SlashCommandHandler}
     */

    /**
     * Removes a slash command.
     * @method
     * @name SlashCommandHandler#remove
     * @param {string} id - ID of the command.
     * @returns {SlashCommand}
     */

    /**
     * Removes all slash commands.
     * @method
     * @name SlashCommandHandler#removeAll
     * @returns {SlashCommandHandler}
     */

    /**
     * Reloads a slash command.
     * @method
     * @name SlashCommandHandler#reload
     * @param {string} id - ID of the command.
     * @returns {SlashCommand}
     */

    /**
     * Reloads all slash commands.
     * @method
     * @name SlashCommandHandler#reloadAll
     * @returns {SlashCommandHandler}
     */
}

module.exports = SlashCommandHandler;

/**
 * Emitted when a slash command is blocked by a pre-message inhibitor.
 * The built-in inhibitors are 'client' and 'bot'.
 * @event SlashCommandHandler#commandBlocked
 * @param {AkairoMessage} message - Message sent.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when no command was found.
 * @event CommandHandler#commandNotFound
 * @param {AkairoMessage} message - Message received.
 */

/**
 * Emitted when a command is found disabled.
 * @event SlashCommandHandler#commandDisabled
 * @param {AkairoMessage} message - Message sent.
 * @param {SlashCommand} command - Command found.
 */

/**
 * Emitted when a command is blocked by a post-message inhibitor.
 * The built-in inhibitors are 'owner', 'guild', and 'dm'.
 * @event SlashCommandHandler#commandBlocked
 * @param {AkairoMessage} message - Message sent.
 * @param {SlashCommand} command - Command blocked.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when a command starts execution.
 * @event SlashCommandHandler#commandStarted
 * @param {AkairoMessage} message - Message sent.
 * @param {SlashCommand} command - Command executed.
 * @param {any} args - The args passed to the command.
 */

/**
 * Emitted when a command finishes execution.
 * @event SlashCommandHandler#commandFinished
 * @param {AkairoMessage} message - Message sent.
 * @param {SlashCommand} command - Command executed.
 * @param {any} args - The args passed to the command.
 * @param {any} returnValue - The command's return value.
 */

/**
 * Emitted when a permissions check is failed.
 * @event SlashCommandHandler#missingPermissions
 * @param {AkairoMessage} message - Message sent.
 * @param {SlashCommand} command - Command blocked.
 * @param {string} type - Either 'client' or 'user'.
 * @param {any} missing - The missing permissions.
 */

/**
 * Emitted when a command or inhibitor errors.
 * @event SlashCommandHandler#error
 * @param {Error} error - The error.
 * @param {AkairoMessage} message - Message sent.
 * @param {?SlashCommand} command - Command executed.
 */

/**
 * Emitted when a command is loaded.
 * @event SlashCommandHandler#load
 * @param {SlashCommand} command - Module loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a command is removed.
 * @event SlashCommandHandler#remove
 * @param {SlashCommand} command - Command removed.
 */

/**
 * Also includes properties from AkairoHandlerOptions.
 * @typedef {AkairoHandlerOptions} SlashCommandHandlerOptions
 * @prop {Snowflake|Snowflake[]|IgnoreCheckPredicate} [ignorePermissions=[]] - ID of user(s) to ignore `userPermissions` checks or a function to ignore.
 */

/**
 * Various parsed components of the message.
 * @typedef {Object} ParsedComponentData
 * @prop {?Command} command - The command used.
 * @prop {?string} prefix - The prefix used.
 * @prop {?string} alias - The alias used.
 * @prop {?string} content - The content to the right of the alias.
 * @prop {?string} afterPrefix - The content to the right of the prefix.
 */

/**
 * A function that returns whether this message should be ignored for a certain check.
 * @typedef {Function} IgnoreCheckPredicate
 * @param {Message} message - Message to check.
 * @param {Command} command - Command to check.
 * @returns {boolean}
 */

