import { Awaitable, Client, ClientOptions, Snowflake, UserResolvable } from 'discord.js';
import type { AkairoClientEvents } from '../typings/events';
import ClientUtil from './ClientUtil.js';
/**
 * The Akairo framework client. Creates the handlers and sets them up.
 */
export default class AkairoClient<Ready extends boolean = boolean> extends Client<Ready> {
    /**
     * The ID of the owner(s).
     */
    ownerID: Snowflake | Snowflake[];
    /**
     * Utility methods.
     */
    util: ClientUtil;
    /**
     * @param options - Options for the client.
     * @param clientOptions - Options for Discord JS client.If not specified, the previous options parameter is used instead.
     */
    constructor(options: AkairoOptions & ClientOptions);
    constructor(options: AkairoOptions, clientOptions: ClientOptions);
    /**
     * Checks if a user is the owner of this bot.
     * @param user - User to check.
     */
    isOwner(user: UserResolvable): boolean;
}
declare type Event = AkairoClientEvents;
export default interface AkairoClient<Ready extends boolean = boolean> extends Client<Ready> {
    on<K extends keyof Event>(event: K, listener: (...args: Event[K]) => Awaitable<void>): this;
    on<S extends string | symbol>(event: Exclude<S, keyof Event>, listener: (...args: any[]) => Awaitable<void>): this;
    once<K extends keyof Event>(event: K, listener: (...args: Event[K]) => Awaitable<void>): this;
    once<S extends string | symbol>(event: Exclude<S, keyof Event>, listener: (...args: any[]) => Awaitable<void>): this;
    emit<K extends keyof Event>(event: K, ...args: Event[K]): boolean;
    emit<S extends string | symbol>(event: Exclude<S, keyof Event>, ...args: unknown[]): boolean;
    off<K extends keyof Event>(event: K, listener: (...args: Event[K]) => Awaitable<void>): this;
    off<S extends string | symbol>(event: Exclude<S, keyof Event>, listener: (...args: any[]) => Awaitable<void>): this;
    removeAllListeners<K extends keyof Event>(event?: K): this;
    removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof Event>): this;
}
/**
 * Options for the client.
 */
export interface AkairoOptions {
    /**
     * Discord ID of the client owner(s).
     * @default []
     */
    ownerID?: Snowflake | Snowflake[];
}
export {};
//# sourceMappingURL=AkairoClient.d.ts.map