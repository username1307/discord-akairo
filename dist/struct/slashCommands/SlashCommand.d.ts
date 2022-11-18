import { ApplicationCommandAutocompleteOption, ApplicationCommandChannelOptionData, ApplicationCommandChoicesData, ApplicationCommandNonOptionsData, ApplicationCommandNumericOptionData, ApplicationCommandStringOptionData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, AutocompleteInteraction, ChatInputCommandInteraction, Message, PermissionResolvable, Snowflake } from 'discord.js';
import type AkairoMessage from '../../util/AkairoMessage';
import type Category from '../../util/Category';
import type AkairoClient from '../AkairoClient';
import AkairoModule, { AkairoModuleOptions } from '../AkairoModule';
import SlashCommandHandler, { IgnoreCheckPredicate, SlashResolveTypes } from './SlashCommandHandler.js';
export default abstract class SlashCommand extends AkairoModule {
    category: Category<string, SlashCommand>;
    channel?: string;
    client: AkairoClient;
    clientPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
    description: CommandDescription;
    filepath: string;
    handler: SlashCommandHandler;
    hidden: boolean;
    id: string;
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    lock?: KeySupplier | 'channel' | 'guild' | 'user';
    locker?: Set<string>;
    name: string;
    ownerOnly: boolean;
    parentCommand?: string;
    prefixId?: string;
    guarded: boolean;
    shortName?: string;
    slashDefaultPermission: boolean;
    slashOptions?: SlashOption[];
    slashLimitDeploy?: boolean;
    commandType: 'command' | 'group' | 'sub';
    userPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
    constructor(id: string, options?: SlashCommandOptions);
    before(message: Message): any;
    exec(interaction: ChatInputCommandInteraction, message: AkairoMessage, ...args: any[]): any;
    autocomplete(interaction: AutocompleteInteraction): any;
}
export default interface SlashCommand extends AkairoModule {
    reload(): Promise<SlashCommand>;
    remove(): SlashCommand;
}
export interface SlashCommandOptions extends AkairoModuleOptions {
    before?: BeforeAction;
    channel?: 'guild' | 'dm';
    clientPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
    description: CommandDescription;
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
    slashLimitDeploy?: boolean;
    commandType: 'command' | 'group' | 'sub';
    userPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
}
export declare type BeforeAction = (message: Message) => any;
export declare type KeySupplier = (message: Message | AkairoMessage, args: any) => string;
export declare type MissingPermissionSupplier = (message: Message | AkairoMessage) => Promise<any> | any;
export interface CommandDescription {
    content: string;
    usage?: string;
    examples?: string[];
}
export interface AkairoApplicationCommandSubGroupData extends ApplicationCommandSubGroupData {
    options?: AkairoApplicationCommandSubCommandData[];
}
export interface AkairoApplicationCommandSubCommandData extends ApplicationCommandSubCommandData {
    options?: (AkairoApplicationCommandChoicesData | AkairoApplicationCommandNonOptionsData | AkairoApplicationCommandChannelOptionData)[];
}
export interface AkairoApplicationCommandChoicesData extends ApplicationCommandChoicesData {
    resolve?: SlashResolveTypes;
}
export interface AkairoApplicationCommandAutocompleteOption extends ApplicationCommandAutocompleteOption {
    resolve?: SlashResolveTypes;
}
export interface AkairoApplicationCommandNumericOptionData extends ApplicationCommandNumericOptionData {
    resolve?: SlashResolveTypes;
}
export interface AkairoApplicationCommandStringOptionData extends ApplicationCommandStringOptionData {
    resolve?: SlashResolveTypes;
}
export interface AkairoApplicationCommandNonOptionsData extends ApplicationCommandNonOptionsData {
    resolve?: SlashResolveTypes;
}
export interface AkairoApplicationCommandChannelOptionData extends ApplicationCommandChannelOptionData {
    resolve?: SlashResolveTypes;
}
export declare type AkairoApplicationCommandOptionData = AkairoApplicationCommandSubGroupData | AkairoApplicationCommandNonOptionsData | AkairoApplicationCommandChannelOptionData | AkairoApplicationCommandChoicesData | AkairoApplicationCommandAutocompleteOption | AkairoApplicationCommandNumericOptionData | AkairoApplicationCommandStringOptionData | AkairoApplicationCommandSubCommandData;
export declare type SlashOption = AkairoApplicationCommandOptionData & {
    resolve?: SlashResolveTypes;
};
//# sourceMappingURL=SlashCommand.d.ts.map