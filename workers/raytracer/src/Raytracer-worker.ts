import { Plane } from "../../../src/math/Plane";
import { Matrix44 } from "../../../src/math/Matrix44";
import { Color } from "../../../src/graphics/Color";
import { Vector3 } from "../../../src/math/Vector3";
import { Vector2 } from "../../../src/math/Vector2";
import { Triangle } from "../../../src/math/Triangle";
import { Basis } from "../../../src/math/Basis";
import { FrameBuffer } from "../../../src/graphics/FrameBuffer";
import { Ray } from "../../../src/math/Ray";
import { AABB } from "../../../src/math/AABB";
import { Quaternion } from "../../../src/math/Quaternion";
import { MathEx } from "../../../src/math/MathEx";

// tslint:disable:no-console
console.log(`Spider Engine Raytracer worker started, Env: ${process.env.NODE_ENV}`);

let db: IDBDatabase;
let worker = self as unknown as Worker;

let standaloneFiles: { [path: string]: string };

const readFile = (path: string) => {
    if (standaloneFiles) {
        return new Promise<string>((resolve, reject) => resolve(standaloneFiles[path]));
    }
    let transaction = db.transaction(["files"], "readonly");
    let objectStore = transaction.objectStore("files");
    return new Promise<string>((resolve, reject) => {
        let request = objectStore.get(path);
        request.onsuccess = e => {
            if (request.result) {
                resolve(request.result);
            } else {
                reject();
            }
        };
        request.onerror = e => reject();
    });
};

let idDatabase: { [id: string]: string };
let config: string;
const initialize = (_config: string, _standaloneFiles?: { [path: string]: string} ) => {
    config = _config;
    const loadIds = () => new Promise<void>((resolve, reject) => {
        readFile("Assets/ids.json")
            .then(data => {
                idDatabase = JSON.parse(data);
                resolve();
            })
            .catch(reject);
    });

    if (config === "standalone") {
        if (_standaloneFiles) {
            standaloneFiles = _standaloneFiles;
        }
        return Promise.resolve();
    } else {
        return new Promise<void>((resolve, reject) => {
            let request = indexedDB.open(`spider-${config}`, 1);
            request.onupgradeneeded = e => {
                let _db = request.result;
                if (_db.objectStoreNames.contains("files") === false) {
                    _db.createObjectStore("files");
                }
            };
            request.onerror = e => reject();
            request.onsuccess = e => {
                db = request.result;
                resolve();
            };
        })
        .then(() => loadIds());
    }
};

class Node {
    worldMatrix = new Matrix44();
    shapes: CollisionShape[] = [];
    color = new Color();
    cullMode: string;
    name: string;
}

class Light {
    color = new Color();
    intensity = 1;
    worldMatrix = new Matrix44();
    type = "DirectionalLight";
}

class RayCollisionResult {
    intersection = new Vector3();
    normal = new Vector3();
    uv = new Vector2();
}

class RayCastResult {
    node: Node;
    set result(result: RayCollisionResult) {
        this._result.intersection.copy(result.intersection);
        this._result.normal.copy(result.normal);
        this._result.uv.copy(result.uv);
    }
    get result() {
        return this._result;
    }
    private _result = new RayCollisionResult();
}

class CollisionShape {
    rayCast(ray: Ray, node: Node): RayCollisionResult | null {
        return null;
    }
}

let invWorld = new Matrix44();
let localRay = new Ray();
let collisionResult = new RayCollisionResult();
class SphereCollisionShape extends CollisionShape {
    radius = 0;
    center: Vector3;
    constructor(radius: number, center: Vector3) {
        super();
        this.radius = radius;
        this.center = center;
    }
    rayCast(ray: Ray, node: Node) {
        invWorld.copy(node.worldMatrix).translate(this.center).invert();
        localRay.copy(ray).transform(invWorld);
        let raySphereResult = localRay.castOnSphere(Vector3.zero, this.radius);
        if (raySphereResult) {
            const useBackFaces = node.cullMode === "Front";
            const rayOutSideSphere = localRay.origin.length > this.radius;
            if (rayOutSideSphere) {
                if (useBackFaces) {
                    collisionResult.intersection.copy(raySphereResult.intersection2).transform(node.worldMatrix);
                    collisionResult.normal.copy(raySphereResult.normal2).flip().transformDirection(node.worldMatrix);
                } else {
                    collisionResult.intersection.copy(raySphereResult.intersection1).transform(node.worldMatrix);
                    collisionResult.normal.copy(raySphereResult.normal1).transformDirection(node.worldMatrix);
                }
                return collisionResult;
            } else {
                if (useBackFaces) {
                    collisionResult.intersection.copy(raySphereResult.intersection1).transform(node.worldMatrix);
                    collisionResult.normal.copy(raySphereResult.normal1).flip().transformDirection(node.worldMatrix);
                    return collisionResult;
                } else {
                    return null;
                }
            }
        }
        return null;
    }
}

class BoxCollisionShape extends CollisionShape {
    aabb: AABB;
    constructor(aabb: AABB) {
        super();
        this.aabb = aabb;
    }
    rayCast(ray: Ray, node: Node) {
        invWorld.copy(node.worldMatrix).invert();
        localRay.copy(ray).transform(invWorld);
        let rayBoxResult = localRay.castOnAABB(this.aabb);
        if (rayBoxResult) {
            const useBackFaces = node.cullMode === "Front";
            let rayOutsideBox = !this.aabb.contains(localRay.origin);
            if (rayOutsideBox) {
                if (useBackFaces) {
                    collisionResult.intersection.copy(rayBoxResult.intersection2).transform(node.worldMatrix);
                    collisionResult.normal.copy(rayBoxResult.normal2).flip().transformDirection(node.worldMatrix);
                } else {
                    collisionResult.intersection.copy(rayBoxResult.intersection1).transform(node.worldMatrix);
                    collisionResult.normal.copy(rayBoxResult.normal1).transformDirection(node.worldMatrix);
                }
                return collisionResult;
            } else {
                if (useBackFaces) {
                    collisionResult.intersection.copy(rayBoxResult.intersection1).transform(node.worldMatrix);
                    collisionResult.normal.copy(rayBoxResult.normal1).flip().transformDirection(node.worldMatrix);
                    return collisionResult;
                } else {
                    return null;
                }
            }
        }
        return null;
    }
}

class PlaneCollisionShape extends CollisionShape {
    plane: Plane;
    constructor(plane: Plane) {
        super();
        this.plane = plane;
    }
    rayCast(ray: Ray, node: Node) {
        invWorld.copy(node.worldMatrix).invert();
        localRay.copy(ray).transform(invWorld);
        let rayPlaneResult = localRay.castOnPlane(this.plane);
        if (rayPlaneResult.intersection) {
            collisionResult.intersection.copy(rayPlaneResult.intersection).transform(node.worldMatrix);
            collisionResult.normal.copy(this.plane.normal).transformDirection(node.worldMatrix);
            return collisionResult;
        }
        return null;
    }
}

namespace Internal {
    export let v1 = new Vector3();
    export let v2 = new Vector3();
    export let v3 = new Vector3();
    export let plane = new Plane();
    export let triangle = new Triangle();
    export let intersection = new Vector3();
    export let normal = new Vector3();
}
class MeshCollisionShape extends CollisionShape {
    positions: number[];
    normals: number[];
    uvs: number[];
    aabb: AABB;
    constructor(positions: number[], normals: number[], uvs: number[], aabb: AABB) {
        super();
        this.positions = positions;
        this.normals = normals;
        this.uvs = uvs;
        this.aabb = aabb;
    }
    rayCast(ray: Ray, node: Node) {
        invWorld.copy(node.worldMatrix).invert();
        localRay.copy(ray).transform(invWorld);
        let { v1, v2, v3, plane, triangle, intersection, normal } = Internal;
        if (localRay.castOnAABB(this.aabb)) {
            const useBackFaces = node.cullMode === "Front";
            const { positions, normals, uvs } = this;
            let distToClosest = 0;
            let noIntersection = true;
            for (let i = 0; i < positions.length; i += 9) {
                v1.set(positions[i], positions[i + 1], positions[i + 2]);
                v2.set(positions[i + 3], positions[i + 4], positions[i + 5]);
                v3.set(positions[i + 6], positions[i + 7], positions[i + 8]);
                plane.setFromPoints(v1, v2, v3);
                let result = localRay.castOnPlane(plane);
                if (result.intersection) {
                    let rayShootingIntoPlane = plane.normal.dot(localRay.direction) < 0;
                    let useTriangle = useBackFaces ? !rayShootingIntoPlane : rayShootingIntoPlane;
                    if (useTriangle) {
                        triangle.set(v1, v2, v3);
                        let coords = triangle.getBarycentricCoords(result.intersection);
                        if (coords.y >= 0 && coords.z >= 0 && coords.y + coords.z <= 1) {
                            let distance = Vector3.distance(ray.origin, result.intersection.transform(node.worldMatrix));
                            if (noIntersection || distance < distToClosest) {
                                distToClosest = distance;
                                intersection.copy(result.intersection);
                                normal.copy(plane.normal).transformDirection(node.worldMatrix);
                                if (useBackFaces) {
                                    normal.flip();
                                }
                                noIntersection = false;
                            }
                        }
                    }
                }
            }
            if (!noIntersection) {
                collisionResult.intersection.copy(intersection);
                collisionResult.normal.copy(normal);
                return collisionResult;
            }
        }
        return null;
    }
}

interface NodeLoader {
    node: Node;
    propertyData: string;
    propertyName: "_material" | "_geometry" | "texture";
}

namespace Internal {
    export let position = new Vector3();
    export let rotation = new Quaternion();
    export let scale = new Vector3();
}
// tslint:disable-next-line
const getTransformMatrix = (transform: any, matrixOut: Matrix44) => {
    const { position, rotation, scale } = Internal;
    const { _position, _rotation, _scale } = transform.properties;
    {
        const { _x, _y, _z } = _position;
        position.set(_x, _y, _z);
    }
    {
        const { _x, _y, _z, _w } = _rotation;
        rotation.set(_x, _y, _z, _w);
    }
    {
        const { _x, _y, _z } = _scale;
        scale.set(_x, _y, _z);
    }
    matrixOut.compose(position, rotation, scale);
};

let localMatrix = new Matrix44();
let nodes: Node[] = [];
let lights: Light[] = [];
// tslint:disable-next-line
const extractMeshesAndMaterials = (entity: any, parentWorldMatrix: Matrix44, loaders: Promise<NodeLoader>[]) => {
    if (!entity.active) {
        return;
    }
    let components = entity.components;
    let worldMatrix = parentWorldMatrix;
    if (components) {
        let light = components.Light;
        if (light) {
            let lightNode = new Light();
            let transform = components.Transform;
            if (transform) {
                getTransformMatrix(transform, localMatrix);
                lightNode.worldMatrix.multiplyMatrices(parentWorldMatrix, localMatrix);
                worldMatrix = lightNode.worldMatrix;
            }
            const { color, intensity, _type } = light.properties;
            const { r, g, b, a } = color;
            lightNode.color.set(r, g, b, a);
            lightNode.intensity = intensity;
            if (_type.data) {
                lightNode.type = _type.data.typeName;
            }
            lights.push(lightNode);
        } else {
            let node = new Node();
            let transform = components.Transform;
            if (transform) {
                getTransformMatrix(transform, localMatrix);
                node.worldMatrix.multiplyMatrices(parentWorldMatrix, localMatrix);
                worldMatrix = node.worldMatrix;
            }
            let collider = components.Collider;
            if (collider && collider.properties._active) {
                const { _shapes } = collider.properties;
                for (let shapeRef of _shapes.data) {
                    let shape = shapeRef.data;
                    if (shape.typeName === "SphereCollisionShape") {
                        const { radius, center } = shape.properties;
                        const { _x, _y, _z } = center;
                        node.shapes.push(new SphereCollisionShape(radius, new Vector3(_x, _y, _z)));

                    } else if (shape.typeName === "PlaneCollisionShape") {
                        const position = Vector3.fromPool();
                        node.worldMatrix.decompose(position, Quaternion.dummy, Vector3.dummy);
                        const normal = Vector3.fromPool().copy(Vector3.up).rotate(Quaternion.dummy).normalize();
                        const { x, y, z } = normal;
                        let distFromOrigin = position.length;
                        distFromOrigin *= position.divide(distFromOrigin).dot(normal);
                        node.shapes.push(new PlaneCollisionShape(new Plane(new Vector3(x, y, z), distFromOrigin)));

                    } else if (shape.typeName === "BoxCollisionShape") {
                        let aabb = new AABB();
                        const { center, extent } = shape.properties;
                        {
                            const { _x, _y, _z } = center;
                            aabb.min.set(_x, _y, _z);
                            aabb.max.set(_x, _y, _z);
                        }
                        {
                            const { _x, _y, _z } = extent;
                            {
                                const { x, y, z } = aabb.min;
                                aabb.min.set(x - _x, y - _y, z - _z);
                            }
                            {
                                const { x, y, z } = aabb.max;
                                aabb.max.set(x + _x, y + _y, z + _z);
                            }
                        }
                        node.shapes.push(new BoxCollisionShape(aabb));
                    } else {
                        console.log(`Unsupported collision shape: '${shape.typeName}'`);
                    }
                }
            }
            let visual = components.Visual;
            if (visual && visual.properties._active) {
                const { _material, _geometry } = visual.properties;
                {
                    const { id } = _material;
                    const path = config === "standalone" ? id : idDatabase[id];
                    if (path) {
                        loaders.push(new Promise((resolve, reject) => {
                            readFile(path)
                                .then(data => {
                                    resolve({
                                        node: node,
                                        propertyData: data,
                                        propertyName: "_material"
                                    });
                                })
                                .catch(() => {
                                    reject();
                                });
                        }));
                    }
                }
                {
                    const { data } = _geometry;
                    if (
                        data
                        && node.shapes.length === 0 // for now, use colliders for raytracing. TODO: use visuals
                    ) {
                        const { typeName } = data;
                        if (typeName === "StaticMesh") {
                            const { mesh } = data.properties;
                            const { id } = mesh;
                            const path = config === "standalone" ? id : idDatabase[id];
                            if (path) {
                                loaders.push(new Promise((resolve, reject) => {
                                    readFile(path)
                                        .then(propertyData => {
                                            resolve({
                                                node: node,
                                                propertyData: propertyData,
                                                propertyName: "_geometry"
                                            });
                                        })
                                        .catch(() => {
                                            reject();
                                        });
                                }));
                            }
                        } else {
                            console.log(`Unsupported geometry: '${typeName}'`);
                        }
                    }
                }

            }
            node.name = entity.name;
            nodes.push(node);
        }
    }

    let children = entity.children;
    if (children) {
        for (let child of children) {
            extractMeshesAndMaterials(child, worldMatrix, loaders);
        }
    }
};

// tslint:disable-next-line
let extractNodes = (root: any) => {
    let meshAndMaterialLoaders: Promise<NodeLoader>[] = [];
    extractMeshesAndMaterials(root, Matrix44.identity, meshAndMaterialLoaders);
    return new Promise<void>((resolve, reject) => {
        Promise.all(meshAndMaterialLoaders)
            .then(loaderDatas => {
                let textureLoaders: Promise<NodeLoader>[] = [];
                for (let loader of loaderDatas) {
                    let propertyValue = JSON.parse(loader.propertyData);
                    if (loader.propertyName === "_material") {
                        const { _shaderParams, _cullMode } = propertyValue.properties;
                        const { diffuse, diffuseMap } = _shaderParams.properties;
                        if (diffuse) {
                            const { r, g, b, a } = diffuse.data;
                            loader.node.color.set(r, g, b, a);
                        }
                        loader.node.cullMode = _cullMode;
                    } else if (loader.propertyName === "_geometry") {
                        const { _vertexBuffer } = propertyValue.properties;
                        const { data } = _vertexBuffer;
                        const { attributes, indices } = data;
                        const { position, normal, uv } = attributes;
                        const aabb = AABB.fromVertexArray(position, indices);
                        loader.node.shapes.push(new MeshCollisionShape(position, normal, uv, aabb));
                    }
                }
                if (textureLoaders.length > 0) {
                    Promise.all(textureLoaders)
                        .then(textureDatas => {
                            console.log("textures loaded");
                            resolve();
                        })
                        .catch(() => reject());
                } else {
                    resolve();
                }
            })
            .catch(() => reject());
    });
};

const rayCast = (ray: Ray) => {
    let toIntersectionSq = 999999;
    let collision = false;
    let rayCastResult = new RayCastResult();
    for (let node of nodes) {
        for (let shape of node.shapes) {
            let result = shape.rayCast(ray, node);
            if (result) {
                let distanceSq = Vector3.distanceSq(ray.origin, result.intersection);
                if (distanceSq < toIntersectionSq) {
                    rayCastResult.result = result;
                    rayCastResult.node = node;
                    toIntersectionSq = distanceSq;
                    collision = true;
                }
            }
        }
    }
    return collision ? rayCastResult : null;
};

let rayTraceSettings = {
    reflections: true,
    shadows: true,
    shadowRadius: .6,
    shadowResolution: 6,
    maxBounces: 3
};

let toLight = new Vector3();
let currentColor = new Color();
let reflectedRay = new Ray();
let toLightRay = new Ray();
let areaOffsetX = new Vector3();
let areaOffsetZ = new Vector3();
let areaOffset = new Vector3();
let localBasis = new Basis();
let rayTrace = (ray: Ray, colorOut: Color, depth: number) => {
    let result = rayCast(ray);
    if (result) {
        const { normal, intersection, uv } = result.result;
        const { node } = result;
        for (let light of lights) {
            // Point Light
            toLight.setFromMatrix(light.worldMatrix).substract(intersection);
            let toLightDist = toLight.length;
            toLight.multiply(1 / toLightDist);

            let dot = toLight.dot(normal);
            if (dot > 0) {
                // Directional Light            
                // toLight.copy(Basis.fromMatrix(light.worldMatrix).forward).flip();
                // let toLightDist = 999999;
                // Vector3.makeBasisFromNormal(normal, localShadowRight, localShadowForward);
                let shade = 1;    
                if (rayTraceSettings.shadows) {
                    localBasis.setFromNormal(normal);
                    let delta = rayTraceSettings.shadowRadius / Math.max(rayTraceSettings.shadowResolution - 1, 1);
                    let startOffset = rayTraceSettings.shadowResolution > 1 ? (-rayTraceSettings.shadowRadius / 2) : 0;
                    let random = () => Math.random() * (delta);
                    for (let i = 0; i < rayTraceSettings.shadowResolution; ++i) {
                        areaOffsetZ.copy(localBasis.forward).multiply(startOffset + i * delta + random());
                        for (let j = 0; j < rayTraceSettings.shadowResolution; ++j) {
                            areaOffsetX.copy(localBasis.right).multiply(startOffset + j * delta + random());
                            areaOffset.copy(areaOffsetZ).add(areaOffsetX);
                            toLightRay.origin.copy(normal).multiply(.0001).add(intersection);
                            toLightRay.direction.setFromMatrix(light.worldMatrix).add(areaOffset).substract(toLightRay.origin).normalize();
                            let toLightResult = rayCast(toLightRay);
                            if (toLightResult) {
                                let toIntersection = Vector3.distance(toLightResult.result.intersection, intersection);
                                if (toIntersection < toLightDist) {
                                    shade -= 1 / (rayTraceSettings.shadowResolution * rayTraceSettings.shadowResolution);
                                }
                            }
                        }
                    }
                }                

                currentColor.copy(node.color).multiplyColor(light.color).multiply(light.intensity * dot * Math.max(shade, 0));
                colorOut.add(currentColor);
            }
        }
        if (rayTraceSettings.reflections) {
            if (depth < rayTraceSettings.maxBounces) {
                // hack pretend alpha holds the reflection factor
                let reflectionFactor = 1 - node.color.a;
                if (reflectionFactor > 0) {
                    reflectedRay.direction.copy(ray.direction).reflect(normal);
                    reflectedRay.origin.copy(reflectedRay.direction).multiply(.0001).add(intersection);
                    let reflectedColorOut = new Color();
                    rayTrace(reflectedRay, reflectedColorOut, depth + 1);
                    currentColor.copy(reflectedColorOut).multiply(reflectionFactor);
                    colorOut.add(currentColor);
                }
            }
        }
    }
};

onmessage = e => {
    initialize(e.data.config, e.data.standaloneFiles).then(() => {
        const { 
            scenePath, 
            targetWidth, 
            targetHeight, 
            rgba, 
            projector, 
            worldMatrix,
            settings
        } = e.data;
        readFile(scenePath).then(sceneData => {
            const scene = JSON.parse(sceneData);
            let makeRay: ((worldMatrix: Matrix44, x: number, y: number, w: number, h: number) => Ray) | null = null;
            if (projector.typeName === "OrthographicProjector") {
                const { _size } = projector.properties;
                const orthoSizeY = _size;
                makeRay = (_worldMatrix: Matrix44, x: number, y: number, w: number, h: number) => {
                    return Ray.dummy.setFromOrthographicView(orthoSizeY, _worldMatrix, x, y, w, h);
                };
            } else if (projector.typeName === "PerspectiveProjector") {
                const { _fov } = projector.properties;
                const fovRadians = MathEx.toRadians(_fov);
                makeRay = (_worldMatrix: Matrix44, x: number, y: number, w: number, h: number) => {
                    return Ray.dummy.setFromPerspectiveView(fovRadians, _worldMatrix, x, y, w, h);
                };
            }

            if (makeRay) {
                let _makeRay = makeRay;
                extractNodes(scene.root).then(() => {
                    let frameBuffer = new FrameBuffer(targetWidth, targetHeight, rgba);
                    let finalColor = new Color();
                    let timer = Date.now();
                    let interval = 1000;
                    rayTraceSettings = settings;
                    for (let i = 0; i < targetHeight; ++i) {
                        for (let j = 0; j < targetWidth; ++j) {
                            let ray = _makeRay(
                                worldMatrix,
                                j,
                                i,
                                targetWidth,
                                targetHeight
                            );
    
                            // environment/background color
                            finalColor.set(0, 0, 0);
                            rayTrace(ray, finalColor, 1);
                            frameBuffer.setPixel(j, i, finalColor);
    
                            // refresh texture
                            let deltaTime = (Date.now() - timer);
                            if (deltaTime > interval) {
                                let before = Date.now();
                                worker.postMessage(frameBuffer.data.buffer);
                                let after = Date.now();
                                interval += after - before;
                                timer = after;
                            }
                        }
                    }
                    worker.postMessage(frameBuffer.data.buffer, [frameBuffer.data.buffer]);
                    worker.postMessage(null);
                    close();
                });
            } else {
                worker.postMessage(null);
                close();
            }            
        });
    });
};
