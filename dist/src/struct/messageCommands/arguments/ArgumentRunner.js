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
const AkairoError_js_1 = __importDefault(require("../../../util/AkairoError.js"));
const Constants_js_1 = require("../../../util/Constants.js");
const Flag_js_1 = __importDefault(require("../Flag.js"));
const Argument_js_1 = __importDefault(require("./Argument.js"));
/**
 * Runs arguments.
 */
class ArgumentRunner {
    /**
     * @param command - MessageCommand to run for.
     */
    constructor(command) {
        this.command = command;
    }
    /**
     * The Akairo client.
     */
    get client() {
        return this.command.client;
    }
    /**
     * The command handler.
     */
    get handler() {
        return this.command.handler;
    }
    /**
     * Runs the arguments.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param generator - Argument generator.
     */
    run(message, parsed, generator) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = {
                usedIndices: new Set(),
                phraseIndex: 0,
                index: 0,
            };
            const augmentRest = (val) => {
                if (Flag_js_1.default.is(val, 'continue')) {
                    val.rest = parsed.all
                        .slice(state.index)
                        .map((x) => x.raw)
                        .join('');
                }
            };
            const iter = generator(message, parsed, state);
            let curr = yield iter.next();
            while (!curr.done) {
                const value = curr.value;
                if (ArgumentRunner.isShortCircuit(value)) {
                    augmentRest(value);
                    return value;
                }
                const res = yield this.runOne(message, parsed, state, new Argument_js_1.default(this.command, value));
                if (ArgumentRunner.isShortCircuit(res)) {
                    augmentRest(res);
                    return res;
                }
                curr = yield iter.next(res);
            }
            augmentRest(curr.value);
            return curr.value;
        });
    }
    /**
     * Runs one argument.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runOne(message, parsed, state, arg) {
        const cases = {
            [Constants_js_1.ArgumentMatches.PHRASE]: this.runPhrase,
            [Constants_js_1.ArgumentMatches.FLAG]: this.runFlag,
            [Constants_js_1.ArgumentMatches.OPTION]: this.runOption,
            [Constants_js_1.ArgumentMatches.REST]: this.runRest,
            [Constants_js_1.ArgumentMatches.SEPARATE]: this.runSeparate,
            [Constants_js_1.ArgumentMatches.TEXT]: this.runText,
            [Constants_js_1.ArgumentMatches.CONTENT]: this.runContent,
            [Constants_js_1.ArgumentMatches.REST_CONTENT]: this.runRestContent,
            [Constants_js_1.ArgumentMatches.NONE]: this.runNone,
        };
        const runFn = cases[arg.match];
        if (runFn == null) {
            throw new AkairoError_js_1.default('UNKNOWN_MATCH_TYPE', arg.match);
        }
        return runFn.call(this, message, parsed, state, arg);
    }
    /**
     * Runs `phrase` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runPhrase(message, parsed, state, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (arg.unordered || arg.unordered === 0) {
                const indices = typeof arg.unordered === 'number'
                    ? Array.from(parsed.phrases.keys()).slice(arg.unordered)
                    : Array.isArray(arg.unordered)
                        ? arg.unordered
                        : Array.from(parsed.phrases.keys());
                for (const i of indices) {
                    if (state.usedIndices.has(i)) {
                        continue;
                    }
                    const phrase = parsed.phrases[i] ? parsed.phrases[i].value : '';
                    // `cast` is used instead of `process` since we do not want prompts.
                    const res = yield arg.cast(message, phrase);
                    if (res != null) {
                        state.usedIndices.add(i);
                        return res;
                    }
                }
                // No indices matched.
                return arg.process(message, '');
            }
            const index = arg.index == null ? state.phraseIndex : arg.index;
            const ret = arg.process(message, parsed.phrases[index] ? parsed.phrases[index].value : '');
            if (arg.index == null) {
                ArgumentRunner.increaseIndex(parsed, state);
            }
            return ret;
        });
    }
    /**
     * Runs `rest` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runRest(message, parsed, state, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = arg.index == null ? state.phraseIndex : arg.index;
            const rest = parsed.phrases
                .slice(index, index + arg.limit)
                .map((x) => x.raw)
                .join('')
                .trim();
            const ret = yield arg.process(message, rest);
            if (arg.index == null) {
                ArgumentRunner.increaseIndex(parsed, state);
            }
            return ret;
        });
    }
    /**
     * Runs `separate` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runSeparate(message, parsed, state, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = arg.index == null ? state.phraseIndex : arg.index;
            const phrases = parsed.phrases.slice(index, index + arg.limit);
            if (!phrases.length) {
                const ret = yield arg.process(message, '');
                if (arg.index != null) {
                    ArgumentRunner.increaseIndex(parsed, state);
                }
                return ret;
            }
            const res = [];
            for (const phrase of phrases) {
                const response = yield arg.process(message, phrase.value);
                if (Flag_js_1.default.is(response, 'cancel')) {
                    return response;
                }
                res.push(response);
            }
            if (arg.index != null) {
                ArgumentRunner.increaseIndex(parsed, state);
            }
            return res;
        });
    }
    /**
     * Runs `flag` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runFlag(message, parsed, state, arg) {
        const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
        if (arg.multipleFlags) {
            const amount = parsed.flags.filter((flag) => names.some((name) => (name === null || name === void 0 ? void 0 : name.toLowerCase()) === flag.key.toLowerCase())).length;
            return amount;
        }
        const flagFound = parsed.flags.some((flag) => names.some((name) => (name === null || name === void 0 ? void 0 : name.toLowerCase()) === flag.key.toLowerCase()));
        return arg.default == null ? flagFound : !flagFound;
    }
    /**
     * Runs `option` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runOption(message, parsed, state, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
            if (arg.multipleFlags) {
                const values = parsed.optionFlags
                    .filter((flag) => names.some((name) => (name === null || name === void 0 ? void 0 : name.toLowerCase()) === flag.key.toLowerCase()))
                    .map((x) => x.value)
                    .slice(0, arg.limit);
                const res = [];
                for (const value of values) {
                    res.push(yield arg.process(message, value));
                }
                return res;
            }
            const foundFlag = parsed.optionFlags.find((flag) => names.some((name) => (name === null || name === void 0 ? void 0 : name.toLowerCase()) === flag.key.toLowerCase()));
            return arg.process(message, foundFlag != null ? foundFlag.value : '');
        });
    }
    /**
     * Runs `text` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runText(message, parsed, state, arg) {
        const index = arg.index == null ? 0 : arg.index;
        const text = parsed.phrases
            .slice(index, index + arg.limit)
            .map((x) => x.raw)
            .join('')
            .trim();
        return arg.process(message, text);
    }
    /**
     * Runs `content` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runContent(message, parsed, state, arg) {
        const index = arg.index == null ? 0 : arg.index;
        const content = parsed.all
            .slice(index, index + arg.limit)
            .map((x) => x.raw)
            .join('')
            .trim();
        return arg.process(message, content);
    }
    /**
     * Runs `restContent` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runRestContent(message, parsed, state, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = arg.index == null ? state.index : arg.index;
            const rest = parsed.all
                .slice(index, index + arg.limit)
                .map((x) => x.raw)
                .join('')
                .trim();
            const ret = yield arg.process(message, rest);
            if (arg.index == null) {
                ArgumentRunner.increaseIndex(parsed, state);
            }
            return ret;
        });
    }
    /**
     * Runs `none` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runNone(message, parsed, state, arg) {
        return arg.process(message, '');
    }
    /**
     * Modifies state by incrementing the indices.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param n - Number of indices to increase by.
     */
    static increaseIndex(parsed, state, n = 1) {
        state.phraseIndex += n;
        while (n > 0) {
            do {
                state.index++;
            } while (parsed.all[state.index] &&
                parsed.all[state.index].type !== 'Phrase');
            n--;
        }
    }
    /**
     * Checks if something is a flag that short circuits.
     * @param value - A value.
     */
    static isShortCircuit(value) {
        return (Flag_js_1.default.is(value, 'cancel') ||
            Flag_js_1.default.is(value, 'retry') ||
            Flag_js_1.default.is(value, 'continue'));
    }
    /**
     * Creates an argument generator from argument options.
     * @param args - Argument options.
     */
    static fromArguments(args) {
        return function* generate() {
            const res = {};
            for (const [id, arg] of args) {
                res[id] = yield arg;
            }
            return res;
        };
    }
}
exports.default = ArgumentRunner;
//# sourceMappingURL=ArgumentRunner.js.map