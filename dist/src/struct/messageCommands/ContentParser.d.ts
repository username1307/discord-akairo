import type { ArgumentOptions } from './arguments/Argument.js';
/**
 * Parses content.
 */
export default class ContentParser {
    /**
     * Words considered flags.
     */
    flagWords: string[];
    /**
     * Words considered option flags.
     */
    optionFlagWords: string[];
    /**
     * Whether to parse quotes. Defaults to `true`.
     */
    quoted: boolean;
    /**
     * Whether to parse a separator.
     */
    separator?: string;
    /**
     * @param options - Options.
     */
    constructor({ flagWords, optionFlagWords, quoted, separator, }?: ContentParserOptions);
    /**
     * Parses content.
     * @param content - Content to parse.
     */
    parse(content: string): ContentParserResult;
    /**
     * Extracts the flags from argument options.
     * @param args - Argument options.
     */
    static getFlags(args: ArgumentOptions[]): ExtractedFlags;
}
/**
 * Options for the content parser.
 */
export interface ContentParserOptions {
    /**
     * Words considered flags.
     * @default []
     */
    flagWords?: string[];
    /**
     * Words considered option flags.
     * @default []
     */
    optionFlagWords?: string[];
    /**
     * Whether to parse quotes.
     * @default true
     */
    quoted?: boolean;
    /**
     * Whether to parse a separator.
     */
    separator?: string;
}
/**
 * Result of parsing.
 */
export interface ContentParserResult {
    /**
     * All phrases and flags.
     */
    all: StringData[];
    /**
     * Phrases.
     */
    phrases: StringData[];
    /**
     * Flags.
     */
    flags: StringData[];
    /**
     * Option flags.
     */
    optionFlags: StringData[];
}
/**
 * A single phrase or flag.
 */
export declare type StringData = {
    /**
     * One of 'Phrase', 'Flag', 'OptionFlag'.
     */
    type: 'Phrase' | 'Flag' | 'OptionFlag';
    /**
     * The key of a 'Flag' or 'OptionFlag'.
     */
    key: string;
    /**
     * The value of a 'Phrase' or 'OptionFlag'.
     */
    value: string;
    /**
     * The raw string with whitespace and/or separator.
     */
    raw: string;
};
/**
 * Flags extracted from an argument list.
 */
export interface ExtractedFlags {
    /**
     * Words considered flags.
     */
    flagWords?: string[];
    /**
     * Words considered option flags.
     */
    optionFlagWords?: string[];
}
//# sourceMappingURL=ContentParser.d.ts.map