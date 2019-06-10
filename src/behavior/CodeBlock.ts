
import * as Attributes from "../core/Attributes";
import { Asset } from "../assets/Asset";

import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import { Debug } from "../io/Debug";
import { VoidSyncEvent } from "ts-events";
import { SerializedObject } from "../core/SerializableObject";
import { EngineEvents } from "../core/EngineEvents";
import { BehaviorErrors } from "./BehaviorErrors";
import { EditorBehaviorExecution } from "../editor/EditorBehaviorExecution";
import { ICodeBlock } from "./ICodeBlock";

/**
 * @hidden
 */
export namespace CodeBlockInternal {
    export const codeProperty = "_code";
    export const trimId = (id: string) => id.split("-").join("");
}

@Attributes.displayName("Code Block")
@Attributes.hasDedicatedEditor(true)
export class CodeBlock extends Asset implements ICodeBlock {
    
    get version() { return 6; }

    get pins() { return this._pins; }
    get code() { return this._code; }
    get program() { return this._program; }
    get hasCompileErrors() { return this._hasCompileErrors; }
    get runtimeError() { return this._runtimeError; }
    get functions() { return this._functions; }
    get isLoading() { return this._isLoading; }

    set code(code: string) {
        this._code = code;
        this.clearErrors();
        if (this._standaloneScript && this._standaloneScript.parentNode) {
            this._standaloneScript.parentNode.removeChild(this._standaloneScript);
        }
        try {
            console.assert(this.templatePath);
            const filePath = (this.templatePath as string)
                // Chrome doesn't like script files with spaces in their path.
                .replace(" ", "_")
                // replace Spider extension with .js            
                .replace(`.${this.constructor.name}`, ".js");

            let runtimeCode = code;
            if (process.env.CONFIG === "editor") {
                // In the editor, the code is not executable but needs to be transformed first
                runtimeCode = EditorBehaviorExecution.generateRuntimeCode(this);
                this.sourceInfo.sourcePath = filePath;
            }

            // Insert sourceURL tag so it gets recognized in Chrome's debugger
            const { protocol, hostname, port } = window.location;
            const _port = (port && port.length > 0) ? `:${port}` : "";
            const finalCode = `${runtimeCode}\r\n//# sourceURL=${protocol}//${hostname}${_port}/${filePath}`;

            if (process.env.CONFIG === "standalone") {
                // Keep it simple in standalone
                // Works in all browsers, but sources not visible in Firefox and Edge   
                this._standaloneScript = document.createElement("script");
                this._standaloneScript.appendChild(document.createTextNode(finalCode));
                (document.head as HTMLHeadElement).appendChild(this._standaloneScript);
                this._isLoading = false;
                this._isLoaded = true;
                return;
            }

            // Doesn't work in Edge (maybe it has a lower limit for data urls??)
            /* 
            this._standaloneScript = document.createElement("script");
            this._standaloneScript.src = `data:text/javascript,${finalCode}`;
            document.head.appendChild(this._standaloneScript);
            this._isLoading = false;
            this._isLoaded = true;
            */

            // Chrome & Firefox only. Sources have random URL in firefox
            /*if (this._scriptUrl) {
                window.URL.revokeObjectURL(this._scriptUrl);
            }
            this._scriptUrl = window.URL.createObjectURL(
                new File(
                    [finalCode],
                    this.templatePath,
                    { type: "text/javascript" }
                )
            );
            this._standaloneScript = document.createElement("script");
            this._standaloneScript.onload = () => {
                let wasLoaded = this._isLoaded;
                this._isLoaded = true;
                this._isLoading = false;
                if (!wasLoaded) {
                    EngineEvents.assetLoaded.post(this);
                }
            };
            this._isLoading = true;
            this._standaloneScript.src = this._scriptUrl;                
            */

            // Works in all browsers, but sources not visible in Firefox (and Edge but who gives a fuck) 
            this._standaloneScript = document.createElement("script");
            this._standaloneScript.appendChild(document.createTextNode(finalCode));
            (document.head as HTMLHeadElement).appendChild(this._standaloneScript);
            const wasLoaded = this._isLoaded;
            this._isLoading = false;
            this._isLoaded = true;
            if (!wasLoaded) {
                EngineEvents.assetLoaded.post(this);
            }

            // window.onerror = (error, url, a, b, c) => {
            //     if (url) {
            //         console.log(`Compile error in: ${url}`);
            //     }
            // };

            /*
                // Works in all browsers, not sure if source is visible in Firefox
                // And requires different invocation code path in editor 
                this._functions = {};
                for (var statement of program.body) {
                    if (statement.type === "FunctionDeclaration") {
                    let functionCode = EditorBehaviorExecution.generateRuntimeFunctionCode(statement.body);
                    // TODO make it safe
                    let functionName = statement.id.name.split("_")[0];
                    // tslint:disable-next-line
                    let params = statement.params.map((p: any) => p.name);            
                    let func = new Function(...params, functionCode);
                    // TODO: func.prototype.doIt = new Function("console.log('Doing it!!!');");                                    
                    this._functions[functionName] = func;
                }
                this._isLoaded = true;
            }
            */
        } catch (e) {
            this.logRuntimeError(e.message);
        } finally {
            BehaviorErrors.checkCodeBlock(this);
        }
    }

    /**
     * @event
     */
    @Attributes.unserializable()
    pinChanged = new VoidSyncEvent();

    /**
     * @hidden
     */
    @Attributes.unserializable()
    // tslint:disable-next-line
    sourceInfo: any;

    protected _pins = new ReferenceArray(BasePin);
    protected _code = `
function onStart() {        
    return ExecutionStatus.Continue;
}

function onUpdate() {
    return ExecutionStatus.Finish;
}
`;

    @Attributes.unserializable()
    // tslint:disable-next-line
    private _program: any;

    @Attributes.unserializable()
    private _functions!: {
        [functioName: string]: Function;
    };

    @Attributes.unserializable()
    private _isLoaded = false;
    @Attributes.unserializable()
    private _isLoading = false;

    @Attributes.unserializable()
    private _standaloneScript!: HTMLScriptElement;
    @Attributes.unserializable()
    private _scriptUrl!: string;

    @Attributes.unserializable()
    private _hasCompileErrors = false;
    // Error, timestamp
    @Attributes.unserializable()
    private _runtimeError?: [string, number];

    logRuntimeError(message: string) {
        Debug.logError(`Error: '${message}' in '${this.templatePath}'`);
        this._runtimeError = [message, Date.now()];
    }

    logCompileError(message: string) {
        Debug.logError(`Error: '${message}' in '${this.templatePath}'`);
        this._hasCompileErrors = true;
    }

    clearRuntimeErrors() {
        delete this._runtimeError;
    }

    isLoaded() {
        return this._isLoaded;
    }

    destroy() {
        if (this._standaloneScript && this._standaloneScript.parentNode) {
            this._standaloneScript.parentNode.removeChild(this._standaloneScript);
        }
        super.destroy();
    }

    // tslint:disable-next-line
    setProperty(property: string, value: any) {
        super.setProperty(property, value);
        if (property === CodeBlockInternal.codeProperty) {
            this.code = value;
        }
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            // tslint:disable-next-line
            json.properties._code = (json.properties._code as any).replace(/getComponent\(("|')UIImage("|')\)/g, 'getComponent("Image")');
            // tslint:disable-next-line
            json.properties._code = (json.properties._code as any).replace(/getComponent\(("|')UIText("|')\)/g, 'getComponent("Text")');
        } else if (previousVersion === 2) {
            // tslint:disable-next-line
            json.properties._code = (json.properties._code as any).replace(/Engine.createFromPrefab/g, 'Engine.createEntity');
        } else if (previousVersion === 3) {
            // tslint:disable-next-line
            json.properties._code = (json.properties._code as any)
                .replace(/Engine.root(\(\))?.findChild/g, "Engine.findEntity")
                // xxx to worldXxx
                .replace(
                    /transform.(_value.)?(position|rotation|scale|forward|right|up)/g,
                    (x: string, i: string, j: string) => {
                        let result = "transform.";
                        if (i) {
                            result = `${result}${i}`;
                        }
                        result = `${result}world${j[0].toUpperCase() + j.substring(1)}`;
                        return result;
                    }
                )
                // localXxx to xxx
                .replace(
                    /transform.(_value.)?local(Position|Rotation|Scale|Forward|Right|Up)/g,
                    (x: string, i: string, j: string) => {
                        let result = "transform.";
                        if (i) {
                            result = `${result}${i}`;
                        }
                        result = `${result}${j}`.toLowerCase();
                        return result;
                    }
                );
        } else if (previousVersion === 4) {
            // tslint:disable-next-line
            json.properties._code = (json.properties._code as any)
                .replace(/Engine.deltaTime/g, "Time.deltaTime")
                .replace(/Engine.isOpenSource/g, "Project.isOpenSource")
                .replace(/Engine.projectName/g, "Project.name")
                .replace(/Engine.importToEditor/g, "Project.importToEditor")
                .replace(/Engine.readSave/g, "SavedData.get")
                .replace(/Engine.writeSave\([a-zA-Z]+\)/g, "SavedData.flush()")
                .replace(
                    /Engine.createEntity\(([a-zA-Z._]+)(, ([a-zA-Z 0-9\(\),]+))?\)/g,
                    (x: string, i: string, j: string, k: string) => {
                        if (k) {
                            return `Entities.create(${i}, { position: ${k} })`;
                        } else {
                            return `Entities.create(${i})`;
                        }
                    }
                )
                .replace(
                    /Engine.destroyEntity\(([a-zA-Z0-9._]+)\)/g,
                    (x: string, i: string, j: string) => `${i}.destroy()`
                )
                .replace(
                    /Engine.findEntity\((['"a-zA-Z0-9._]+)\)/g,
                    (x: string, i: string, j: string) => `Entities.find(${i})`
                )
                .replace(/Engine.getScreenSize\(\)/g, "Renderer.screenSize")
                .replace(
                    /Engine.loadScene\((['"a-zA-Z0-9_/.]+)\)/g,
                    (x: string, i: string, j: string) => `Scenes.load(${i})`
                )
                .replace(
                    /Engine.loadAssetById\(([a-zA-Z0-9_.]+)\)/g,
                    (x: string, i: string, j: string) => `Assets.loadById(${i})`
                )
                .replace(
                    /Engine.loadAsset\((['"a-zA-Z0-9._]+)\)/g,
                    (x: string, i: string, j: string) => `Assets.load(${i})`
                )
                ;
        } else if (previousVersion === 5) {
             // tslint:disable-next-line
             json.properties._code = (json.properties._code as any)
                .replace(/.owner./g, ".entity.")
                .replace(/.findEntities/g, ".filterChildren")
                .replace(
                    /getComponent\(["']([a-zA-Z]+)["']\)/g,
                    (x: string, i: string) => `getComponentByName("${i}")`
                )
                .replace(
                    /setComponent\(["']([a-zA-Z]+)["']\)/g,
                    (x: string, i: string) => `setComponentByName("${i}")`
                )
                .replace(
                    /getOrSetComponent\(["']([a-zA-Z]+)["']\)/g,
                    (x: string, i: string) => `getOrSetComponentByName("${i}")`
                )
                ;
        }
        return json;
    }

    private clearErrors() {
        this._hasCompileErrors = false;
        this.clearRuntimeErrors();
        BehaviorErrors.clear(this);
    }
}
