import "reflect-metadata";
import { EnumLiterals } from "./EnumLiterals";

export function hidden() {
    return Reflect.metadata("hidden", true);
}

export function unserializable() {
    return Reflect.metadata("unserializable", true);
}

export function editable(param: boolean) {
    return Reflect.metadata("editable", param);
}

export function creatable(param: boolean) {
    return Reflect.metadata("creatable", param);
}

export function referencable(param: boolean) {
    return Reflect.metadata("referencable", param);
}

export function defaultType(typeName: string) {
    return Reflect.metadata("defaultType", typeName);
}

export function nullable(param: boolean) {
    return Reflect.metadata("nullable", param);
}

export function mandatory() {
    return Reflect.metadata("mandatory", true);
}

export function hasDedicatedEditor(param: boolean) {
    return Reflect.metadata("hasDedicatedEditor", param);
}

export function displayName(name: string) {
    return Reflect.metadata("displayName", name);
}

export function sortOrder(order: number) {
    return Reflect.metadata("sortOrder", order);
}

export function helpUrl(url: string) {
    return Reflect.metadata("helpUrl", url);
}

export function enumLiterals(enumObject: object, getDisplayName?: (literal: string) => string) {

    const literals: { [property: string]: number } = {};
    const entries = Object.entries(enumObject);
    console.assert(entries.length % 2 === 0);
    for (let i = entries.length / 2; i < entries.length; ++i) {
        const [literal, value] = entries[i];
        Object.assign(literals, { [literal]: value });
    }

    return Reflect.metadata("enumLiterals", { literals, getDisplayName } as EnumLiterals);
}

export function requires(typeName: string) {
    return Reflect.metadata("requires", typeName);
}

export function exclusiveWith(typeName: string | string[]) {
    return Reflect.metadata("exclusiveWith", typeName);
}

export function rotationAngle() {
    return Reflect.metadata("rotationAngle", true);
}
