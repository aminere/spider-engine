export interface EnumLiterals {
    [key: string]: number;
}
export interface EnumLiteralsMetadata {
    literals: EnumLiterals;
    getDisplayName?: (literal: string) => string;
}
