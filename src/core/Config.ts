export class Config {
    static isWeb() {
        return process.env.PLATFORM === "web";
    }

    static isDesktop() {
        return process.env.PLATFORM === "electron";
    }

    static isProduction() {
        return process.env.NODE_ENV === "production";
    }

    static isDevelopment() {
        return process.env.NODE_ENV === "development";
    }

    static isEditor() {
        return process.env.CONFIG === "editor";
    }

    static isStandalone() {
        return process.env.CONFIG === "standalone";
    }
}
