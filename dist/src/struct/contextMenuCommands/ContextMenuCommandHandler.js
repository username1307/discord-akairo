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
const AkairoError_js_1 = __importDefault(require("../../util/AkairoError.js"));
const Constants_js_1 = require("../../util/Constants.js");
const AkairoHandler_js_1 = __importDefault(require("../AkairoHandler.js"));
const ContextMenuCommand_js_1 = __importDefault(require("./ContextMenuCommand.js"));
/**
 * Loads context menu messageCommands and handles them.
 */
class ContextMenuCommandHandler extends AkairoHandler_js_1.default {
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client, options) {
        const { directory, classToHandle = ContextMenuCommand_js_1.default, extensions = ['.js', '.ts'], automateCategories, loadFilter, } = options !== null && options !== void 0 ? options : {};
        if (!(classToHandle.prototype instanceof ContextMenuCommand_js_1.default ||
            classToHandle === ContextMenuCommand_js_1.default)) {
            throw new AkairoError_js_1.default('INVALID_CLASS_TO_HANDLE', classToHandle.name, ContextMenuCommand_js_1.default.name);
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
    handle(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = this.modules.find((module) => module.name === interaction.commandName);
            if (!command) {
                this.emit(Constants_js_1.ContextCommandHandlerEvents.NOT_FOUND, interaction);
                return false;
            }
            if (command.ownerOnly && !this.client.isOwner(interaction.user.id)) {
                this.emit(Constants_js_1.ContextCommandHandlerEvents.BLOCKED, interaction, command, Constants_js_1.BuiltInReasons.OWNER);
            }
            try {
                this.emit(Constants_js_1.ContextCommandHandlerEvents.STARTED, interaction, command);
                const ret = yield command.exec(interaction);
                this.emit(Constants_js_1.ContextCommandHandlerEvents.FINISHED, interaction, command, ret);
                return true;
            }
            catch (err) {
                this.emitError(err, interaction, command);
                return false;
            }
        });
    }
    /**
     * Handles errors from the handling.
     * @param err - The error.
     * @param interaction - Interaction that called the command.
     * @param command - MessageCommand that errored.
     */
    emitError(err, interaction, command) {
        if (this.listenerCount(Constants_js_1.ContextCommandHandlerEvents.ERROR)) {
            this.emit(Constants_js_1.ContextCommandHandlerEvents.ERROR, err, interaction, command);
            return;
        }
        throw err;
    }
}
exports.default = ContextMenuCommandHandler;
//# sourceMappingURL=ContextMenuCommandHandler.js.map