
export interface EnumLiterals {
    literals: { [property: string]: string };
    getDisplayName?: (literal: string) => string;
}
