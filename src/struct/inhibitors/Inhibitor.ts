/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Message } from 'discord.js';
import AkairoError from '../../util/AkairoError.js';
import type AkairoMessage from '../../util/AkairoMessage.js';
import type Category from '../../util/Category.js';
import type AkairoClient from '../AkairoClient.js';
import AkairoModule, { AkairoModuleOptions } from '../AkairoModule.js';
import type MessageCommand from '../messageCommands/MessageCommand';
import type InhibitorHandler from './InhibitorHandler.js';
import SlashCommand from '../slashCommands/SlashCommand';

/**
 * Represents an inhibitor.
 */
export default abstract class Inhibitor extends AkairoModule {
    /**
     * The priority of the inhibitor.
     */
    public declare priority: number;

    /**
     * The category the inhibitor belongs to.
     */
    public declare category: Category<string, Inhibitor>;

    /**
     * The Akairo client.
     */
    public declare client: AkairoClient;

    /**
     * The filepath.
     */
    public declare filepath: string;

    /**
     * The inhibitor handler.
     */
    public declare handler: InhibitorHandler;

    /**
     * The ID of this inhibitor.
     */
    public declare id: string;

    /**
     * Reason emitted when command is inhibited.
     */
    public declare reason: string;

    /**
     * The type of the inhibitor for when it should run.
     */
    public declare type: string;

    /**
     * @param id - Inhibitor ID.
     * @param options - Options for the inhibitor.
     */
    public constructor(id: string, options?: InhibitorOptions) {
        const {
            category,
            reason = '',
            type = 'post',
            priority = 0,
        } = options ?? {};

        super(id, { category });

        this.reason = reason;
        this.type = type;
        this.priority = priority;
    }

    /**
     * Checks if message should be blocked.
     * A return value of true will block the message.
     * If returning a Promise, a resolved value of true will block the message.
     * @param message - Message being handled.
     * @param command - MessageCommand to check.
     */
    public exec(
        message: Message,
        command?: MessageCommand | SlashCommand
    ): boolean | Promise<boolean>;
    public exec(
        message: Message | AkairoMessage,
        command?: MessageCommand | SlashCommand
    ): boolean | Promise<boolean>;
    public exec(
        message: Message | AkairoMessage,
        command?: MessageCommand | SlashCommand
    ): boolean | Promise<boolean> {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
}

export default interface Inhibitor extends AkairoModule {
    /**
     * Reloads the inhibitor.
     */
    reload(): Promise<Inhibitor>;

    /**
     * Removes the inhibitor.
     */
    remove(): Inhibitor;
}

/**
 * Options to use for inhibitor execution behavior.
 * Also includes properties from AkairoModuleOptions.
 */
export interface InhibitorOptions extends AkairoModuleOptions {
    /**
     * Reason emitted when command or message is blocked.
     * @default ""
     */
    reason?: string;

    /**
     * Can be 'all' to run on all messages, 'pre' to run on messages not blocked by the built-in inhibitors, or 'post' to run on messages that are messageCommands.
     * @default "post"
     */
    type?: 'all' | 'pre' | 'post';

    /**
     * Priority for the inhibitor for when more than one inhibitor's block a message.
     * The inhibitor with the highest priority is the one that is used for the block reason.
     * @default 0
     */
    priority?: number;
}
