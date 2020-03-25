export interface EnumLiterals {
    literals: {
        [property: string]: number;
    };
    getDisplayName?: (literal: string) => string;
}
