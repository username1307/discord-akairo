import {
    ApplicationCommandAutocompleteOption,
    ApplicationCommandChannelOptionData,
    ApplicationCommandChoicesData,
    ApplicationCommandNonOptionsData,
    ApplicationCommandNumericOptionData,
    ApplicationCommandStringOptionData,
    ApplicationCommandSubCommandData,
    ApplicationCommandSubGroupData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Message,
    PermissionResolvable,
    Snowflake,
} from 'discord.js';
import AkairoError from '../../util/AkairoError';
import type AkairoMessage from '../../util/AkairoMessage';
import type Category from '../../util/Category';
import type AkairoClient from '../AkairoClient';
import AkairoModule, { AkairoModuleOptions } from '../AkairoModule';
import SlashCommandHandler, {
    IgnoreCheckPredicate,
    SlashResolveTypes,
} from './SlashCommandHandler.js';

export default abstract class SlashCommand extends AkairoModule {
    public declare category: Category<string, SlashCommand>;
    public declare channel?: string;
    public declare client: AkairoClient;
    public declare clientPermissions?:
        | PermissionResolvable
        | PermissionResolvable[]
        | MissingPermissionSupplier;
    public declare description: string;
    public declare filepath: string;
    public declare handler: SlashCommandHandler;
    public declare hidden: boolean;
    public declare id: string;
    public declare ignorePermissions?:
        | Snowflake
        | Snowflake[]
        | IgnoreCheckPredicate;
    public declare lock?: KeySupplier | 'channel' | 'guild' | 'user';
    public declare locker?: Set<string>;
    public declare name: string;
    public declare ownerOnly: boolean;
    public declare parentCommand?: string;
    public declare prefixId?: string;
    public declare guarded: boolean;
    public declare shortName?: string;
    public declare slashDefaultPermission: boolean;
    public declare slashOptions?: SlashOption[];
    public declare commandType: 'command' | 'group' | 'sub';
    public declare userPermissions?:
        | PermissionResolvable
        | PermissionResolvable[]
        | MissingPermissionSupplier;

    constructor(id: string, options?: SlashCommandOptions) {
        super(id, { category: options?.category });

        const {
            before = this.before || (() => undefined),
            channel = null,
            clientPermissions = this.clientPermissions,
            description,
            guarded = false,
            hidden = false,
            ignorePermissions,
            lock,
            name,
            ownerOnly = false,
            parentCommand,
            prefixId,
            shortName,
            slashDefaultPermission,
            slashOptions = [],
            commandType,
            userPermissions = this.userPermissions,
        } = options ?? {};

        this.before = before.bind(this);
        this.channel = channel!;
        this.clientPermissions =
            typeof clientPermissions === 'function'
                ? clientPermissions.bind(this)
                : clientPermissions;
        this.description = description!;
        this.guarded = Boolean(guarded);
        this.hidden = Boolean(hidden);
        this.lock = lock;
        this.name = name!;
        this.ownerOnly = Boolean(ownerOnly);
        this.parentCommand = parentCommand;
        this.prefixId = prefixId;
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
        this.ignorePermissions =
            typeof ignorePermissions === 'function'
                ? ignorePermissions.bind(this)
                : ignorePermissions;
        this.shortName = shortName;
        this.slashDefaultPermission = slashDefaultPermission!;
        this.slashOptions = slashOptions;
        this.commandType = commandType!;
    }

    public before(message: Message): any {}

    public exec(
        interaction: ChatInputCommandInteraction,
        message: AkairoMessage,
        ...args: any[]
    ): any;
    public exec(
        interaction: ChatInputCommandInteraction,
        message: AkairoMessage,
        ...args: any[]
    ): any {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    public autocomplete(interaction: AutocompleteInteraction): any {}
}

export default interface SlashCommand extends AkairoModule {
    reload(): Promise<SlashCommand>;
    remove(): SlashCommand;
}

export interface SlashCommandOptions extends AkairoModuleOptions {
    before?: BeforeAction;
    channel?: 'guild' | 'dm';
    clientPermissions?:
        | PermissionResolvable
        | PermissionResolvable[]
        | MissingPermissionSupplier;
    description: string;
    guarded?: boolean;
    hidden?: boolean;
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    lock?: KeySupplier | 'guild' | 'channel' | 'user';
    name: string;
    ownerOnly?: boolean;
    parentCommand?: string;
    prefixId?: string;
    shortName?: string;
    slashDefaultPermission?: boolean;
    slashOptions?: SlashOption[];
    commandType: 'command' | 'group' | 'sub';
    userPermissions?:
        | PermissionResolvable
        | PermissionResolvable[]
        | MissingPermissionSupplier;
}

export type BeforeAction = (message: Message) => any;

export type KeySupplier = (
    message: Message | AkairoMessage,
    args: any
) => string;

export type MissingPermissionSupplier = (
    message: Message | AkairoMessage
) => Promise<any> | any;

export interface AkairoApplicationCommandSubGroupData
    extends ApplicationCommandSubGroupData {
    options?: AkairoApplicationCommandSubCommandData[];
}

export interface AkairoApplicationCommandSubCommandData
    extends ApplicationCommandSubCommandData {
    options?: (
        | AkairoApplicationCommandChoicesData
        | AkairoApplicationCommandNonOptionsData
        | AkairoApplicationCommandChannelOptionData
    )[];
}

export interface AkairoApplicationCommandChoicesData
    extends ApplicationCommandChoicesData {
    resolve?: SlashResolveTypes;
}

export interface AkairoApplicationCommandAutocompleteOption
    extends ApplicationCommandAutocompleteOption {
    resolve?: SlashResolveTypes;
}

export interface AkairoApplicationCommandNumericOptionData
    extends ApplicationCommandNumericOptionData {
    resolve?: SlashResolveTypes;
}

export interface AkairoApplicationCommandStringOptionData
    extends ApplicationCommandStringOptionData {
    resolve?: SlashResolveTypes;
}

export interface AkairoApplicationCommandNonOptionsData
    extends ApplicationCommandNonOptionsData {
    resolve?: SlashResolveTypes;
}

export interface AkairoApplicationCommandChannelOptionData
    extends ApplicationCommandChannelOptionData {
    resolve?: SlashResolveTypes;
}

export type AkairoApplicationCommandOptionData =
    | AkairoApplicationCommandSubGroupData
    | AkairoApplicationCommandNonOptionsData
    | AkairoApplicationCommandChannelOptionData
    | AkairoApplicationCommandChoicesData
    | AkairoApplicationCommandAutocompleteOption
    | AkairoApplicationCommandNumericOptionData
    | AkairoApplicationCommandStringOptionData
    | AkairoApplicationCommandSubCommandData;

export type SlashOption = AkairoApplicationCommandOptionData & {
    resolve?: SlashResolveTypes;
};
