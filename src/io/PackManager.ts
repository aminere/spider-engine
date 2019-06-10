
// import * as $ from "jquery";
import { Debug } from "./Debug";

/**
 * @hidden
 */
var packs: object = {
    "./../../editor/data/bundle.json": require("./../../editor/data/bundle.json")
};

/**
 * @hidden
 */
var PackManager = function () {
    return {
        load: (path: string) => {
            if (path in packs) {
                var distPath = packs[path];
                Debug.log(`Loading Pack ${distPath}`);
                // TODO find equivalent
                // $.ajax({
                //     url: distPath,
                //     success: function (data) {
                //         Debug.log(data);
                //     }
                // });
            } else {
                Debug.log(`Pack ${path} not found`);
            }
        }
    };
}();

export { PackManager };
