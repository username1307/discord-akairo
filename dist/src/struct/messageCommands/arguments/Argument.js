"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_js_1 = require("../../../util/Constants.js");
const Util_js_1 = __importDefault(require("../../../util/Util.js"));
const Flag_js_1 = __importDefault(require("../Flag.js"));
/**
 * Represents an argument for a command.
 */
class Argument {
    /**
     * @param command - MessageCommand of the argument.
     * @param options - Options for the argument.
     */
    constructor(command, options = {}) {
        const { match = Constants_js_1.ArgumentMatches.PHRASE, type = Constants_js_1.ArgumentTypes.STRING, flag = null, multipleFlags = false, index = null, unordered = false, limit = Infinity, prompt = null, default: defaultValue = null, otherwise = null, modifyOtherwise = null, } = options;
        this.command = command;
        this.match = match;
        this.type = typeof type === 'function' ? type.bind(this) : type;
        this.flag = flag;
        this.multipleFlags = multipleFlags;
        this.index = index;
        this.unordered = unordered;
        this.limit = limit;
        this.prompt = prompt;
        this.default =
            typeof defaultValue === 'function'
                ? defaultValue.bind(this)
                : defaultValue;
        this.otherwise =
            typeof otherwise === 'function' ? otherwise.bind(this) : otherwise;
        this.modifyOtherwise = modifyOtherwise;
    }
    /**
     * The client.
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
     * Casts a phrase to this argument's type.
     * @param message - Message that called the command.
     * @param phrase - Phrase to process.
     */
    cast(message, phrase) {
        return Argument.cast(this.type, this.handler.resolver, message, phrase);
    }
    /**
     * Collects input from the user by prompting.
     * @param message - Message to prompt.
     * @param commandInput - Previous input from command if there was one.
     * @param parsedInput - Previous parsed input from command if there was one.
     */
    async collect(message, commandInput = '', parsedInput = null) {
        const promptOptions = {};
        Object.assign(promptOptions, this.handler.argumentDefaults.prompt);
        Object.assign(promptOptions, this.command.argumentDefaults.prompt);
        Object.assign(promptOptions, this.prompt || {});
        const isInfinite = promptOptions.infinite ||
            (this.match === Constants_js_1.ArgumentMatches.SEPARATE && !commandInput);
        const additionalRetry = Number(Boolean(commandInput));
        const values = isInfinite ? [] : null;
        const getText = async (promptType, prompter, retryCount, inputMessage, inputPhrase, inputParsed) => {
            let text = await Util_js_1.default.intoCallable(prompter).call(this, message, {
                retries: retryCount,
                infinite: isInfinite,
                message: inputMessage,
                phrase: inputPhrase,
                failure: inputParsed,
            });
            if (Array.isArray(text)) {
                text = text.join('\n');
            }
            const modifier = {
                start: promptOptions.modifyStart,
                retry: promptOptions.modifyRetry,
                timeout: promptOptions.modifyTimeout,
                ended: promptOptions.modifyEnded,
                cancel: promptOptions.modifyCancel,
            }[promptType];
            if (modifier) {
                text = await modifier.call(this, message, text, {
                    retries: retryCount,
                    infinite: isInfinite,
                    message: inputMessage,
                    phrase: inputPhrase,
                    failure: inputParsed,
                });
                if (Array.isArray(text)) {
                    text = text.join('\n');
                }
            }
            return text;
        };
        // eslint-disable-next-line complexity
        const promptOne = async (prevMessage, prevInput, prevParsed, retryCount) => {
            let sentStart;
            // This is either a retry prompt, the start of a non-infinite, or the start of an infinite.
            if (retryCount !== 1 || !isInfinite || !values?.length) {
                const promptType = retryCount === 1 ? 'start' : 'retry';
                const prompter = retryCount === 1
                    ? promptOptions.start
                    : promptOptions.retry;
                const startText = await getText(promptType, prompter, retryCount, prevMessage, prevInput, prevParsed);
                if (startText) {
                    sentStart = await (message.util || message.channel).send(startText);
                    if (message.util && sentStart) {
                        message.util.setEditable(false);
                        message.util.setLastResponse(sentStart);
                        message.util.addMessage(sentStart);
                    }
                }
            }
            let input;
            try {
                input = (await message.channel.awaitMessages({
                    filter: (m) => m.author.id === message.author.id,
                    max: 1,
                    time: promptOptions.time,
                    errors: ['time'],
                })).first();
                if (message.util)
                    message.util.addMessage(input);
            }
            catch (err) {
                const timeoutText = await getText('timeout', promptOptions.timeout, retryCount, prevMessage, prevInput, '');
                if (timeoutText) {
                    const sentTimeout = await message.channel.send(timeoutText);
                    if (message.util)
                        message.util.addMessage(sentTimeout);
                }
                return Flag_js_1.default.cancel();
            }
            if (promptOptions.breakout) {
                const looksLike = await this.handler.parseCommand(input);
                if (looksLike && looksLike.command)
                    return Flag_js_1.default.retry(input);
            }
            if (input?.content.toLowerCase() ===
                promptOptions.cancelWord.toLowerCase()) {
                const cancelText = await getText('cancel', promptOptions.cancel, retryCount, input, input?.content, 'cancel');
                if (cancelText) {
                    const sentCancel = await message.channel.send(cancelText);
                    if (message.util)
                        message.util.addMessage(sentCancel);
                }
                return Flag_js_1.default.cancel();
            }
            if (isInfinite &&
                input?.content.toLowerCase() ===
                    promptOptions.stopWord.toLowerCase()) {
                if (!values?.length)
                    return promptOne(input, input?.content, null, retryCount + 1);
                return values;
            }
            const parsedValue = await this.cast(input, input.content);
            if (Argument.isFailure(parsedValue)) {
                if (retryCount <= promptOptions.retries) {
                    return promptOne(input, input?.content, parsedValue, retryCount + 1);
                }
                const endedText = await getText('ended', promptOptions.ended, retryCount, input, input?.content, 'stop');
                if (endedText) {
                    const sentEnded = await message.channel.send(endedText);
                    if (message.util)
                        message.util.addMessage(sentEnded);
                }
                return Flag_js_1.default.cancel();
            }
            if (isInfinite) {
                values.push(parsedValue);
                const limit = promptOptions.limit;
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                if (values?.length < limit)
                    return promptOne(message, input.content, parsedValue, 1);
                return values;
            }
            return parsedValue;
        };
        this.handler.addPrompt(message.channel, message.author);
        const returnValue = await promptOne(message, commandInput, parsedInput, 1 + additionalRetry);
        if (this.handler.commandUtil && message.util) {
            message.util.setEditable(false);
        }
        this.handler.removePrompt(message.channel, message.author);
        return returnValue;
    }
    /**
     * Processes the type casting and prompting of the argument for a phrase.
     * @param message - The message that called the command.
     * @param phrase - The phrase to process.
     */
    async process(message, phrase) {
        const commandDefs = this.command.argumentDefaults;
        const handlerDefs = this.handler.argumentDefaults;
        const optional = (typeof this.prompt === 'object' &&
            this.prompt &&
            this.prompt.optional) ??
            (commandDefs.prompt && commandDefs.prompt.optional) ??
            (handlerDefs.prompt && handlerDefs.prompt.optional) ??
            null;
        const doOtherwise = async (failure) => {
            const otherwise = this.otherwise ??
                commandDefs.otherwise ??
                handlerDefs.otherwise ??
                null;
            const modifyOtherwise = this.modifyOtherwise ??
                commandDefs.modifyOtherwise ??
                handlerDefs.modifyOtherwise ??
                null;
            let text = await Util_js_1.default.intoCallable(otherwise).call(this, message, {
                phrase,
                failure,
            });
            if (Array.isArray(text)) {
                text = text.join('\n');
            }
            if (modifyOtherwise) {
                text = await modifyOtherwise.call(this, message, text, {
                    phrase,
                    failure: failure,
                });
                if (Array.isArray(text)) {
                    text = text.join('\n');
                }
            }
            if (text) {
                const sent = await message.channel.send(text);
                if (message.util)
                    message.util.addMessage(sent);
            }
            return Flag_js_1.default.cancel();
        };
        if (!phrase && optional) {
            if (this.otherwise != null) {
                return doOtherwise(null);
            }
            return Util_js_1.default.intoCallable(this.default)(message, {
                phrase,
                failure: null,
            });
        }
        const res = await this.cast(message, phrase);
        if (Argument.isFailure(res)) {
            if (this.otherwise != null) {
                return doOtherwise(res);
            }
            if (this.prompt != null) {
                return this.collect(message, phrase, res);
            }
            return this.default == null
                ? res
                : Util_js_1.default.intoCallable(this.default)(message, {
                    phrase,
                    failure: res,
                });
        }
        return res;
    }
    static async cast(type, resolver, message, phrase) {
        if (Array.isArray(type)) {
            for (const entry of type) {
                if (Array.isArray(entry)) {
                    if (entry.some((t) => t.toLowerCase() === phrase.toLowerCase())) {
                        return entry[0];
                    }
                }
                else if (entry.toLowerCase() === phrase.toLowerCase()) {
                    return entry;
                }
            }
            return null;
        }
        if (typeof type === 'function') {
            let res = type(message, phrase);
            if (Util_js_1.default.isPromise(res))
                res = await res;
            return res;
        }
        if (type instanceof RegExp) {
            const match = phrase.match(type);
            if (!match)
                return null;
            const matches = [];
            if (type.global) {
                let matched;
                while ((matched = type.exec(phrase)) != null) {
                    matches.push(matched);
                }
            }
            return { match, matches };
        }
        if (resolver.type(type)) {
            let res = resolver.type(type)?.call(this, message, phrase);
            if (Util_js_1.default.isPromise(res))
                res = await res;
            return res;
        }
        return phrase || null;
    }
    static compose(...types) {
        return async function typeFn(message, phrase) {
            let acc = phrase;
            for (let entry of types) {
                if (typeof entry === 'function')
                    entry = entry.bind(this);
                acc = await Argument.cast(entry, this.handler.resolver, message, acc);
                if (Argument.isFailure(acc))
                    return acc;
            }
            return acc;
        };
    }
    static composeWithFailure(...types) {
        return async function typeFn(message, phrase) {
            let acc = phrase;
            for (let entry of types) {
                if (typeof entry === 'function')
                    entry = entry.bind(this);
                acc = await Argument.cast(entry, this.handler.resolver, message, acc);
            }
            return acc;
        };
    }
    /**
     * Checks if something is null, undefined, or a fail flag.
     * @param value - Value to check.
     */
    static isFailure(value) {
        return value == null || Flag_js_1.default.is(value, 'fail');
    }
    static product(...types) {
        return async function typeFn(message, phrase) {
            const results = [];
            for (let entry of types) {
                if (typeof entry === 'function')
                    entry = entry.bind(this);
                const res = await Argument.cast(entry, this.handler.resolver, message, phrase);
                if (Argument.isFailure(res))
                    return res;
                results.push(res);
            }
            return results;
        };
    }
    static range(type, min, max, inclusive = false) {
        return Argument.validate(type, (msg, p, x) => {
            const o = typeof x === 'number' || typeof x === 'bigint'
                ? x
                : x.length != null
                    ? x.length
                    : x.size != null
                        ? x.size
                        : x;
            return o >= min && (inclusive ? o <= max : o < max);
        });
    }
    static tagged(type, tag = type) {
        return async function typeFn(message, phrase) {
            if (typeof type === 'function')
                type = type.bind(this);
            const res = await Argument.cast(type, this.handler.resolver, message, phrase);
            if (Argument.isFailure(res)) {
                return Flag_js_1.default.fail({ tag, value: res });
            }
            return { tag, value: res };
        };
    }
    static taggedUnion(...types) {
        return async function typeFn(message, phrase) {
            for (let entry of types) {
                entry = Argument.tagged(entry);
                const res = await Argument.cast(entry, this.handler.resolver, message, phrase);
                if (!Argument.isFailure(res))
                    return res;
            }
            return null;
        };
    }
    static taggedWithInput(type, tag = type) {
        return async function typeFn(message, phrase) {
            if (typeof type === 'function')
                type = type.bind(this);
            const res = await Argument.cast(type, this.handler.resolver, message, phrase);
            if (Argument.isFailure(res)) {
                return Flag_js_1.default.fail({ tag, input: phrase, value: res });
            }
            return { tag, input: phrase, value: res };
        };
    }
    static union(...types) {
        return async function typeFn(message, phrase) {
            for (let entry of types) {
                if (typeof entry === 'function')
                    entry = entry.bind(this);
                const res = await Argument.cast(entry, this.handler.resolver, message, phrase);
                if (!Argument.isFailure(res))
                    return res;
            }
            return null;
        };
    }
    static validate(type, predicate) {
        return async function typeFn(message, phrase) {
            if (typeof type === 'function')
                type = type.bind(this);
            const res = await Argument.cast(type, this.handler.resolver, message, phrase);
            if (Argument.isFailure(res))
                return res;
            if (!predicate.call(this, message, phrase, res))
                return null;
            return res;
        };
    }
    static withInput(type) {
        return async function typeFn(message, phrase) {
            if (typeof type === 'function')
                type = type.bind(this);
            const res = await Argument.cast(type, this.handler.resolver, message, phrase);
            if (Argument.isFailure(res)) {
                return Flag_js_1.default.fail({ input: phrase, value: res });
            }
            return { input: phrase, value: res };
        };
    }
}
exports.default = Argument;
//# sourceMappingURL=Argument.js.map