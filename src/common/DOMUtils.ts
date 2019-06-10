/**
 * @hidden
 */
export class DOMUtils {
    static getWheelDelta(delta: number, deltaMode: number) {
        if (deltaMode === 1) { // DOM_DELTA_LINE
            return delta * 32; // approximation, supposed to be the font size
        } else if (deltaMode === 2) { // DOM_DELTA_PAGE
            return delta * 32 * 10; // approximation, supposed to be the 'page' size whatever the fuck this is
        } else {
            return delta; // DOM_DELTA_PIXEL
        }
    } 
}
