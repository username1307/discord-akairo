import type { ContextMenuCommandInteraction, Snowflake } from 'discord.js';
import type Category from '../../util/Category.js';
import type AkairoClient from '../AkairoClient.js';
import AkairoModule, { AkairoModuleOptions } from '../AkairoModule.js';
import type ContextMenuCommandHandler from './ContextMenuCommandHandler.js';
/**
 * Represents a context menu command.
 */
export default abstract class ContextMenuCommand extends AkairoModule {
    /**
     * Assign context menu messageCommands to Specific guilds. This option will make the messageCommands not register globally, but only in the chosen servers.
     */
    guilds?: Snowflake[];
    /**
     * The name of the context menu command.
     */
    name: string;
    /**
     * Usable only by the client owner.
     */
    ownerOnly?: boolean;
    /**
     * Whether to allow client superUsers(s) only.
     */
    superUserOnly?: boolean;
    /**
     * The type of the context menu command.
     */
    type: 'USER' | 'MESSAGE';
    /**
     * The category of this context menu command.
     */
    category: Category<string, ContextMenuCommand>;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The filepath.
     */
    filepath: string;
    /**
     * The handler.
     */
    handler: ContextMenuCommandHandler;
    /**
     * @param id - Listener ID.
     * @param options - Options for the context menu command.
     */
    constructor(id: string, options: ContextMenuCommandOptions);
    /**
     * Executes the context menu command.
     * @param interaction - The context menu command interaction.
     */
    exec(interaction: ContextMenuCommandInteraction): any;
}
export default interface ContextMenuCommand extends AkairoModule {
    /**
     * Reloads the context menu command.
     */
    reload(): Promise<ContextMenuCommand>;
    /**
     * Removes the context menu command.
     */
    remove(): ContextMenuCommand;
}
/**
 * Options to use for context menu command execution behavior.
 */
export interface ContextMenuCommandOptions extends AkairoModuleOptions {
    /**
     * Assign context menu messageCommands to Specific guilds. This option will make the messageCommands not register globally, but only in the chosen servers.
     */
    guilds?: Snowflake[];
    /**
     * The name of the context menu command.
     */
    name: string;
    /**
     * Usable only by the client owner.
     */
    ownerOnly?: boolean;
    /**
     * Whether to allow client superUsers(s) only.
     */
    superUserOnly?: boolean;
    /**
     * The type of the context menu command.
     */
    type: 'USER' | 'MESSAGE';
}
//# sourceMappingURL=ContextMenuCommand.d.ts.map