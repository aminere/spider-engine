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

    const literals = {};
    const entries = Object.entries(enumObject);
    console.assert(entries.length % 2 === 0);
    for (let i = entries.length / 2; i < entries.length; ++i) {
        Object.assign(literals, { [entries[i][0]]: entries[i][1] });
    }

    return Reflect.metadata("enumLiterals", {
        literals: literals,
        getDisplayName: getDisplayName
    } as EnumLiterals);
}

export function requires(typeName: string) {
    return Reflect.metadata("requires", typeName);
}
