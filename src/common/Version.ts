
export class Version {
    // increment when default assets change
    public static get assets() { return 25; }

    // increment before cloud deployment
    // reset to 1 when assets are incremented
    public static get iteration() { return 7; }
}
