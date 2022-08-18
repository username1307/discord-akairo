import AkairoError from '../../util/AkairoError.js';
import { BuiltInReasons, ContextCommandHandlerEvents, } from '../../util/Constants.js';
import AkairoHandler from '../AkairoHandler.js';
import ContextMenuCommand from './ContextMenuCommand.js';
/**
 * Loads context menu messageCommands and handles them.
 */
export default class ContextMenuCommandHandler extends AkairoHandler {
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client, options) {
        const { directory, classToHandle = ContextMenuCommand, extensions = ['.js', '.ts'], automateCategories, loadFilter, } = options ?? {};
        if (!(classToHandle.prototype instanceof ContextMenuCommand ||
            classToHandle === ContextMenuCommand)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, ContextMenuCommand.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter,
        });
        this.setup();
    }
    /**
     * Set up the context menu command handler
     */
    setup() {
        this.client.once('ready', () => {
            this.client.on('interactionCreate', (i) => {
                if (!i.isContextMenuCommand())
                    return;
                this.handle(i);
            });
        });
    }
    /**
     * Handles an interaction.
     * @param interaction - Interaction to handle.
     */
    async handle(interaction) {
        const command = this.modules.find((module) => module.name === interaction.commandName);
        if (!command) {
            this.emit(ContextCommandHandlerEvents.NOT_FOUND, interaction);
            return false;
        }
        if (command.ownerOnly && !this.client.isOwner(interaction.user.id)) {
            this.emit(ContextCommandHandlerEvents.BLOCKED, interaction, command, BuiltInReasons.OWNER);
        }
        try {
            this.emit(ContextCommandHandlerEvents.STARTED, interaction, command);
            const ret = await command.exec(interaction);
            this.emit(ContextCommandHandlerEvents.FINISHED, interaction, command, ret);
            return true;
        }
        catch (err) {
            this.emitError(err, interaction, command);
            return false;
        }
    }
    /**
     * Handles errors from the handling.
     * @param err - The error.
     * @param interaction - Interaction that called the command.
     * @param command - MessageCommand that errored.
     */
    emitError(err, interaction, command) {
        if (this.listenerCount(ContextCommandHandlerEvents.ERROR)) {
            this.emit(ContextCommandHandlerEvents.ERROR, err, interaction, command);
            return;
        }
        throw err;
    }
}
//# sourceMappingURL=ContextMenuCommandHandler.js.map