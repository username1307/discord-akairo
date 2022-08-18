import {
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    Awaitable,
    ChannelType,
    ChatInputCommandInteraction,
    Collection,
    CommandInteractionOption,
    CommandInteractionOptionResolver,
    InteractionType,
    Snowflake,
} from 'discord.js';
import type { SlashCommandHandlerEvents as SlashCommandHandlerEventsType } from '../../typings/events';
import AkairoError from '../../util/AkairoError';
import AkairoMessage from '../../util/AkairoMessage';
import type Category from '../../util/Category';
import {
    BuiltInReasons,
    SlashCommandHandlerEvents,
} from '../../util/Constants';
import Util from '../../util/Util';
import AkairoClient from '../AkairoClient';
import AkairoHandler, {
    LoadPredicate,
    AkairoHandlerOptions,
} from '../AkairoHandler';
import type AkairoModule from '../AkairoModule';
import ContextMenuCommandHandler from '../contextMenuCommands/ContextMenuCommandHandler';
import type InhibitorHandler from '../inhibitors/InhibitorHandler';
import type ListenerHandler from '../listeners/ListenerHandler';
import TypeResolver from '../messageCommands/arguments/TypeResolver';
import SlashCommand, {
    KeySupplier,
    AkairoApplicationCommandChannelOptionData,
    AkairoApplicationCommandChoicesData,
    AkairoApplicationCommandNonOptionsData,
    AkairoApplicationCommandSubCommandData,
    AkairoApplicationCommandSubGroupData,
} from './SlashCommand';
import MessageCommandHandler from '../messageCommands/MessageCommandHandler';

export default class SlashCommandHandler extends AkairoHandler {
    public declare blockBots: boolean;
    public declare blockClient: boolean;
    public declare categories: Collection<
        string,
        Category<string, SlashCommand>
    >;
    public declare classToHandle: typeof SlashCommand;
    public declare client: AkairoClient;
    public declare directory: string;
    public declare ignorePermissions:
        | Snowflake
        | Snowflake[]
        | IgnoreCheckPredicate;
    public declare inhibitorHandler: InhibitorHandler | null;
    public declare modules: Collection<string, SlashCommand>;
    public declare names: Collection<string, string>;
    public declare resolver: TypeResolver;
    public declare skipBuiltInPostInhibitors: boolean;

    public constructor(
        client: AkairoClient,
        options: SlashCommandHandlerOptions
    ) {
        const {
            directory,
            classToHandle = SlashCommand,
            extensions = ['.js', '.ts'],
            automateCategories,
            loadFilter,
            blockClient = true,
            blockBots = true,
            ignorePermissions = [],
            skipBuiltInPostInhibitors = false,
        } = options ?? {};

        if (
            !(
                classToHandle.prototype instanceof SlashCommand ||
                classToHandle === SlashCommand
            )
        ) {
            throw new AkairoError(
                'INVALID_CLASS_TO_HANDLE',
                classToHandle.name,
                SlashCommand.name
            );
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter,
        });

        this.resolver = new TypeResolver(
            this as unknown as MessageCommandHandler
        );
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

    protected setup() {
        this.client.once('ready', () => {
            this.client.on('interactionCreate', (i) => {
                if (i.isChatInputCommand()) void this.handleSlash(i);
                if (i.type === InteractionType.ApplicationCommandAutocomplete)
                    this.handleAutocomplete(i);
            });
        });
    }

    public override register(command: SlashCommand, filepath?: string): void {
        super.register(command, filepath);

        const conflict = this.names.get(command.name.toLowerCase());
        if (conflict)
            throw new AkairoError(
                'ALIAS_CONFLICT',
                command.name,
                command.id,
                conflict
            );

        const name = command.name.toLowerCase();
        this.names.set(name, command.id);
    }

    public override deregister(command: SlashCommand): void {
        const name = command.name.toLowerCase();
        this.names.delete(name);
        super.deregister(command);
    }

    public async handleSlash(
        interaction: ChatInputCommandInteraction
    ): Promise<boolean | null> {
        let commandName = interaction.commandName;
        if (interaction.options.getSubcommandGroup(false) !== null)
            commandName += ` ${interaction.options.getSubcommandGroup()}`;
        if (interaction.options.getSubcommand(false) !== null)
            commandName += ` ${interaction.options.getSubcommand()}`;

        const commandModule = this.findCommand(commandName);

        if (!commandModule) {
            this.emit(
                SlashCommandHandlerEvents.SLASH_COMMAND_NOT_FOUND,
                interaction
            );
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
            const convertedOptions: ConvertedOptionsType = {};

            if (
                (interaction.options as CommandInteractionOptionResolver)[
                    '_group'
                ]
            )
                convertedOptions['subcommandGroup'] = (
                    interaction.options as CommandInteractionOptionResolver
                )['_group'];
            if (
                (interaction.options as CommandInteractionOptionResolver)[
                    '_subcommand'
                ]
            )
                convertedOptions['subcommand'] = (
                    interaction.options as CommandInteractionOptionResolver
                )['_subcommand'];
            for (const option of (
                interaction.options as CommandInteractionOptionResolver
            )['_hoistedOptions']) {
                if (
                    [
                        ApplicationCommandOptionType.Subcommand,
                        ApplicationCommandOptionType.SubcommandGroup,
                    ].includes(option.type)
                )
                    continue;

                convertedOptions[option.name] = interaction.options[
                    Util.snakeToCamelCase(
                        `GET_${ApplicationCommandOptionType[
                            option.type
                        ].toUpperCase()}`
                    ) as GetFunctions
                ](option.name, false);
            }

            // Make options that are not found to be null so that it matches the behavior normal messageCommands.
            (() => {
                type SubCommand = AkairoApplicationCommandSubCommandData;
                type SubCommandGroup = AkairoApplicationCommandSubGroupData;
                type NonSubSlashOptions =
                    | AkairoApplicationCommandChoicesData
                    | AkairoApplicationCommandNonOptionsData
                    | AkairoApplicationCommandChannelOptionData;

                if (
                    convertedOptions.subcommand ||
                    convertedOptions.subcommandGroup
                ) {
                    const usedSubcommandOrGroup =
                        commandModule.slashOptions?.find(
                            (o) =>
                                o.name === convertedOptions.subcommand &&
                                [
                                    ApplicationCommandOptionType.Subcommand,
                                    'SUB_COMMAND',
                                    ApplicationCommandOptionType.SubcommandGroup,
                                    'SUB_COMMAND_GROUP',
                                ].includes(o.type)
                        );

                    if (!usedSubcommandOrGroup) {
                        this.client.emit(
                            'AkairoDebug',
                            `Unable to find subcommand`
                        );
                        return;
                    }
                    if (
                        [
                            ApplicationCommandOptionType.Subcommand,
                            'SUB_COMMAND',
                        ].includes(usedSubcommandOrGroup.type)
                    ) {
                        if (!(usedSubcommandOrGroup as SubCommand).options) {
                            this.client.emit(
                                'AkairoDebug',
                                `Unable to find subcommand options`
                            );
                            return;
                        }
                        handleOptions(
                            (usedSubcommandOrGroup as SubCommand).options!
                        );
                    } else if (
                        [
                            ApplicationCommandOptionType.SubcommandGroup,
                            'SUB_COMMAND_GROUP',
                        ].includes(usedSubcommandOrGroup.type)
                    ) {
                        const usedSubCommand = (
                            usedSubcommandOrGroup as SubCommandGroup
                        ).options?.find(
                            (subcommand) =>
                                subcommand.name === convertedOptions.subcommand
                        );
                        if (!usedSubCommand) {
                            this.client.emit(
                                'AkairoDebug',
                                `Unable to find subcommand`
                            );
                            return;
                        } else if (!usedSubCommand.options) {
                            this.client.emit(
                                'AkairoDebug',
                                `Unable to find subcommand options`
                            );
                            return;
                        }

                        handleOptions(usedSubCommand.options);
                    } else {
                        throw new Error(
                            `Unexpected command type ${usedSubcommandOrGroup.type}`
                        );
                    }
                } else {
                    handleOptions(
                        (commandModule.slashOptions ??
                            []) as NonSubSlashOptions[]
                    );
                }

                function handleOptions(options: NonSubSlashOptions[]) {
                    for (const option of options) {
                        if (
                            !Reflect.has(convertedOptions, option.name) ||
                            convertedOptions[option.name] === undefined
                        ) {
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
                    key = (commandModule.lock as KeySupplier)(
                        message,
                        convertedOptions
                    );
                if (Util.isPromise(key)) key = await key;
                if (key) {
                    if (commandModule.locker?.has(key)) {
                        key = null;
                        this.emit(
                            SlashCommandHandlerEvents.SLASH_COMMAND_LOCKED,
                            message,
                            commandModule
                        );
                        return true;
                    }
                    commandModule.locker?.add(key);
                }
            } catch (err: any) {
                this.emitError(err, message, commandModule);
            } finally {
                if (key) commandModule.locker?.delete(key);
            }

            try {
                this.emit(
                    SlashCommandHandlerEvents.SLASH_COMMAND_STARTED,
                    message,
                    commandModule,
                    convertedOptions
                );
                const ret = await commandModule.exec(
                    interaction,
                    message,
                    convertedOptions
                );
                this.emit(
                    SlashCommandHandlerEvents.SLASH_COMMAND_FINISHED,
                    message,
                    commandModule,
                    convertedOptions,
                    ret
                );
                return true;
            } catch (err) {
                this.emit(
                    SlashCommandHandlerEvents.ERROR,
                    err,
                    message,
                    commandModule
                );
                return false;
            }
        } catch (err: any) {
            this.emitError(err, message, commandModule);
            return null;
        }
    }

    public handleAutocomplete(interaction: AutocompleteInteraction): void {
        let commandName = interaction.commandName;
        if (interaction.options.getSubcommandGroup(false) !== null)
            commandName += ` ${interaction.options.getSubcommandGroup()}`;
        if (interaction.options.getSubcommand(false) !== null)
            commandName += ` ${interaction.options.getSubcommand()}`;

        const commandModule = this.findCommand(commandName);

        if (!commandModule) {
            this.emit(
                SlashCommandHandlerEvents.SLASH_COMMAND_NOT_FOUND,
                interaction
            );
            return;
        }

        this.client.emit(
            'AkairoDebug',
            `Autocomplete started for ${interaction.commandName}`
        );
        commandModule.autocomplete(interaction);
    }

    public async runAllTypeInhibitors(
        message: AkairoMessage
    ): Promise<boolean> {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('all', message)
            : null;

        if (reason != null) {
            this.emit(
                SlashCommandHandlerEvents.MESSAGE_BLOCKED,
                message,
                reason
            );
        } else if (!message.author) {
            this.emit(
                SlashCommandHandlerEvents.MESSAGE_BLOCKED,
                message,
                BuiltInReasons.AUTHOR_NOT_FOUND
            );
        } else if (
            this.blockClient &&
            message.author.id === this.client.user?.id
        ) {
            this.emit(
                SlashCommandHandlerEvents.MESSAGE_BLOCKED,
                message,
                BuiltInReasons.CLIENT
            );
        } else if (this.blockBots && message.author.bot) {
            this.emit(
                SlashCommandHandlerEvents.MESSAGE_BLOCKED,
                message,
                BuiltInReasons.BOT
            );
        } else {
            return false;
        }

        return true;
    }

    public async runPreTypeInhibitors(
        message: AkairoMessage
    ): Promise<boolean> {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('pre', message)
            : null;

        if (reason != null) {
            this.emit(
                SlashCommandHandlerEvents.MESSAGE_BLOCKED,
                message,
                reason
            );
        } else {
            return false;
        }

        return true;
    }

    public async runPostTypeInhibitors(
        message: AkairoMessage,
        command: SlashCommand
    ): Promise<boolean> {
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

    public async runPermissionChecks(
        message: AkairoMessage,
        command: SlashCommand
    ): Promise<boolean> {
        const event = SlashCommandHandlerEvents.SLASH_MISSING_PERMISSIONS;

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

    public emitError(
        err: Error,
        message: AkairoMessage,
        command?: SlashCommand | AkairoModule
    ): void {
        if (this.listenerCount(SlashCommandHandlerEvents.ERROR)) {
            this.emit(SlashCommandHandlerEvents.ERROR, err, message, command);
            return;
        }

        throw err;
    }

    public findCommand(name: string): SlashCommand {
        return this.modules.get(this.names.get(name.toLowerCase())!)!;
    }

    public useInhibitorHandler(
        inhibitorHandler: InhibitorHandler
    ): SlashCommandHandler {
        this.inhibitorHandler = inhibitorHandler;
        this.resolver.inhibitorHandler = inhibitorHandler;

        return this;
    }

    public useListenerHandler(
        listenerHandler: ListenerHandler
    ): SlashCommandHandler {
        this.resolver.listenerHandler = listenerHandler;

        return this;
    }

    public useContextMenuCommandHandler(
        contextMenuCommandHandler: ContextMenuCommandHandler
    ): SlashCommandHandler {
        this.resolver.contextMenuCommandHandler = contextMenuCommandHandler;

        return this;
    }
}

type Events = SlashCommandHandlerEventsType;

export default interface SlashCommandHandler extends AkairoHandler {
    load(thing: string | SlashCommand): Promise<SlashCommand>;
    loadAll(
        directory?: string,
        filter?: LoadPredicate
    ): Promise<SlashCommandHandler>;
    remove(id: string): SlashCommand;
    removeAll(): SlashCommandHandler;
    reload(id: string): Promise<SlashCommand>;
    reloadAll(): Promise<SlashCommandHandler>;

    on<K extends keyof Events>(
        event: K,
        listener: (...args: Events[K]) => Awaitable<void>
    ): this;
    once<K extends keyof Events>(
        event: K,
        listener: (...args: Events[K]) => Awaitable<void>
    ): this;
}

export interface SlashCommandHandlerOptions extends AkairoHandlerOptions {
    blockBots?: boolean;
    blockClient?: boolean;
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    skipBuiltInPostInhibitors?: boolean;
}

export type IgnoreCheckPredicate = (
    message: AkairoMessage,
    command: SlashCommand
) => boolean;

export type SlashResolveTypes =
    | 'boolean'
    | 'channel'
    | 'string'
    | 'integer'
    | 'number'
    | 'user'
    | 'member'
    | 'role'
    | 'mentionable'
    | 'message'
    | 'attachment';

type GetFunctions =
    | 'getBoolean'
    | 'getChannel'
    | 'getString'
    | 'getInteger'
    | 'getNumber'
    | 'getUser'
    | 'getMember'
    | 'getRole'
    | 'getMentionable'
    | 'getAttachment';

type ConvertedOptionsType = {
    [key: string]:
        | string
        | boolean
        | number
        | null
        | NonNullable<CommandInteractionOption['channel']>
        | NonNullable<CommandInteractionOption['user']>
        | NonNullable<CommandInteractionOption['member']>
        | NonNullable<CommandInteractionOption['role']>
        | NonNullable<CommandInteractionOption['member' | 'role' | 'user']>
        | NonNullable<CommandInteractionOption['message']>
        | NonNullable<CommandInteractionOption['attachment']>;
};
