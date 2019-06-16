
import { Vector3 } from "../../math/Vector3";
import { Matrix44 } from "../../math/Matrix44";
import { AABB } from "../../math/AABB";
import { BoxCollisionShape } from "../../collision/BoxCollisionShape";
import { AsyncUtils } from "../../core/AsyncUtils";
import { Basis } from "../../math/Basis";
import { Quaternion } from "../../math/Quaternion";
import { Asset } from "../../assets/Asset";
import { VertexBuffer } from "../VertexBuffer";
import { WebGL } from "../WebGL";
import { Shader } from "../Shader";
import { Color } from "../Color";
import { Camera } from "../Camera";
import { GraphicUtils } from "../GraphicUtils";
import { Material } from "../Material";
import { IObjectManagerInternal } from "../../core/IObjectManager";
import { defaultAssets } from "../../assets/DefaultAssets";

namespace Private {
    export const crossSize = 1;
    export const basis = new Basis();
    export const modelViewMatrix = new Matrix44();
    export const viewMatrix = new Matrix44();
    export const dummy1 = new Quaternion();
    export const dummy2 = new Quaternion();

    export const line = new VertexBuffer();
    line.setData("position", [0, 0, 0, 0, 0, 0]);
    line.primitiveType = "LINES";

    export const cross = new VertexBuffer();
    cross.setData(
        "position",
        [
            -crossSize, 0, 0, crossSize, 0, 0,
            0, -crossSize, 0, 0, crossSize, 0,
            0, 0, -crossSize, 0, 0, crossSize
        ]
    );

    cross.primitiveType = "LINES";

    export const billboard = new VertexBuffer();
    billboard.setData(
        "position",
        [
            -1, 1, 0.0,
            1, 1, 0.0,
            -1, -1, 0.0,
            -1, -1, 0.0,
            1, 1, 0.0,
            1, -1, 0.0
        ]
    );
    billboard.primitiveType = "TRIANGLES";

    export const quad = new VertexBuffer();
    quad.setData(
        "position",
        [
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0
        ]
    );
    quad.primitiveType = "TRIANGLES";

    export const circle = function () {
        const vb = new VertexBuffer();
        const vertexCount = 100;
        const angleStep = Math.PI * 2 / vertexCount;
        let angle = 0;
        const circleVertices: number[] = [];
        circleVertices.length = (vertexCount + 1) * 3;
        for (let i = 0; i < vertexCount + 1; ++i) {
            circleVertices[i * 3] = Math.cos(angle);
            circleVertices[i * 3 + 1] = Math.sin(angle);
            circleVertices[i * 3 + 2] = 0;
            angle += angleStep;
        }
        vb.setData("position", circleVertices);
        vb.primitiveType = "LINE_STRIP";
        return vb;
    }();

    export const rect = new VertexBuffer();
    rect.setData(
        "position",
        [
            0, 0, 0,
            1, 0, 0,
            1, 1, 0,
            0, 1, 0,
            0, 0, 0
        ]
    );        
    rect.primitiveType = "LINE_STRIP";

    export let debugMaterial: Material;

    export function drawQuad(p1: Vector3, p2: Vector3, p3: Vector3, p4: Vector3) {
        p1.toArray(quad.data.position, 0);
        p2.toArray(quad.data.position, 3);
        p3.toArray(quad.data.position, 6);
        p3.toArray(quad.data.position, 9);
        p2.toArray(quad.data.position, 12);
        p4.toArray(quad.data.position, 15);
        quad.dirtifyData("position");
        GraphicUtils.drawVertexBuffer(WebGL.context, quad, debugMaterial.shader as Shader);
    }
}

export class GeometryRenderer {

    static defaultAssets = [
        {
            path: "Assets/DefaultAssets/Editor/DebugMaterial.Material",
            set: (asset: Asset) => Private.debugMaterial = asset as Material
        }
    ];

    static init() {
        return new Promise<void>((resolve, reject) => {
            AsyncUtils.processBatch(
                GeometryRenderer.defaultAssets,
                (a, success, error) => {
                    IObjectManagerInternal.instance.loadObject(a.path)
                        .then(tuple => {
                            a.set(tuple[0] as Asset);
                            success();
                        })
                        .catch(error);
                },
                hasErrors => {
                    resolve();
                }
            );
        });
    }

    static unload() {
        const gl = WebGL.context;
        Private.cross.unload(gl);
        Private.line.unload(gl);
        Private.billboard.unload(gl);
        Private.quad.unload(gl);
        Private.rect.unload(gl);
        if (Private.debugMaterial) {
            Private.debugMaterial.destroy();
        }
    }

    static applyProjectionMatrix(projection: Matrix44) {
        Private.debugMaterial.applyParameter("projectionMatrix", projection);
    }

    static setViewMatrix(view: Matrix44) {
        Private.viewMatrix.copy(view);
    }

    static begin() {
        return Private.debugMaterial.begin();
    }

    static drawLine(start: Vector3, end: Vector3, color: Color, worldMatrix: Matrix44) {
        Private.debugMaterial.applyParameter("ambient", color);
        Private.debugMaterial.applyParameter("modelViewMatrix", Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, worldMatrix));
        start.toArray(Private.line.data.position, 0);
        end.toArray(Private.line.data.position, 3);
        Private.line.dirtifyData("position");
        GraphicUtils.drawVertexBuffer(WebGL.context, Private.line, Private.debugMaterial.shader as Shader);
    }

    static drawCone(radius: number, height: number, distFromOrigin: number, forward: Vector3, up: Vector3, color: Color, worldMatrix: Matrix44) {
        Private.debugMaterial.applyParameter("ambient", color);
        let absolutePosition = Vector3.fromPool().setFromMatrix(worldMatrix);
        let position = Vector3.fromPool().copy(forward).multiply(distFromOrigin).add(absolutePosition);
        let rotation = Quaternion.fromPool().lookAt(forward, up);
        let scale = Vector3.fromPool().set(radius, height, radius);
        const { dummy1, dummy2 } = Private;
        Private.modelViewMatrix.compose(
            position, 
            dummy1.multiplyQuaternions(
                dummy2.setFromEulerAngles(Math.PI / 2, 0, 0),
                rotation
            ), 
            scale
        );
        Private.debugMaterial.applyParameter(
            "modelViewMatrix",
            Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, Private.modelViewMatrix));
        GraphicUtils.drawVertexBuffer(WebGL.context, defaultAssets.primitives.cone.vertexBuffer, Private.debugMaterial.shader as Shader);
    }

    static drawCross(p: Vector3, color: Color) {
        Private.debugMaterial.applyParameter("ambient", color);
        Private.modelViewMatrix.copy(Matrix44.identity).setPosition(p);
        Private.debugMaterial.applyParameter("modelViewMatrix", Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, Private.modelViewMatrix));
        GraphicUtils.drawVertexBuffer(WebGL.context, Private.cross, Private.debugMaterial.shader as Shader);
    }

    static drawBillboard(p: Vector3, size: number, forward: Vector3, color: Color, camera: Camera) {
        Private.debugMaterial.applyParameter("ambient", color);
        Private.modelViewMatrix.makeLookAt(forward, camera.entity.transform.worldUp).transpose();
        Private.modelViewMatrix.scale(Vector3.fromPool().copy(Vector3.one).multiply(size));
        Private.modelViewMatrix.setPosition(p);
        Private.modelViewMatrix.multiplyMatrices(camera.getViewMatrix(), Private.modelViewMatrix);
        Private.debugMaterial.applyParameter("modelViewMatrix", Private.modelViewMatrix);
        GraphicUtils.drawVertexBuffer(WebGL.context, Private.billboard, Private.debugMaterial.shader as Shader);
    }

    static drawQuad(
        topLeft: Vector3,
        topRight: Vector3,
        botLeft: Vector3,
        botRight: Vector3,
        color: Color,
        worldMatrix: Matrix44
    ) {
        Private.debugMaterial.applyParameter("ambient", color);
        Private.debugMaterial.applyParameter("modelViewMatrix", Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, worldMatrix));
        Private.drawQuad(topLeft, topRight, botLeft, botRight);
    }

    static drawCircle(color: Color, worldMatrix: Matrix44) {
        Private.debugMaterial.applyParameter("ambient", color);
        Private.debugMaterial.applyParameter("modelViewMatrix", Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, worldMatrix));
        GraphicUtils.drawVertexBuffer(WebGL.context, Private.circle, Private.debugMaterial.shader as Shader);
    }

    static drawAABB(aabb: AABB, color: Color, worldMatrix: Matrix44) {
        Private.debugMaterial.applyParameter("ambient", color);
        Private.debugMaterial.applyParameter("modelViewMatrix", Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, worldMatrix));

        let vTop1 = Vector3.fromPool().set(aabb.min.x, aabb.max.y, aabb.min.z);
        let vTop2 = Vector3.fromPool().set(aabb.max.x, aabb.max.y, aabb.min.z);
        let vTop3 = Vector3.fromPool().set(aabb.min.x, aabb.max.y, aabb.max.z);
        let vTop4 = Vector3.fromPool().set(aabb.max.x, aabb.max.y, aabb.max.z);
        let vBottom1 = Vector3.fromPool().set(aabb.min.x, aabb.min.y, aabb.min.z);
        let vBottom2 = Vector3.fromPool().set(aabb.max.x, aabb.min.y, aabb.min.z);
        let vBottom3 = Vector3.fromPool().set(aabb.min.x, aabb.min.y, aabb.max.z);
        let vBottom4 = Vector3.fromPool().set(aabb.max.x, aabb.min.y, aabb.max.z);

        Private.drawQuad(vTop1, vTop2, vTop3, vTop4);
        Private.drawQuad(vBottom1, vBottom2, vBottom3, vBottom4);
        Private.drawQuad(vTop3, vTop4, vBottom3, vBottom4);
        Private.drawQuad(vTop1, vTop2, vBottom1, vBottom2);
        Private.drawQuad(vTop1, vTop3, vBottom1, vBottom3);
        Private.drawQuad(vTop2, vTop4, vBottom2, vBottom4);
    }

    static drawBox(box: BoxCollisionShape, color: Color, worldMatrix: Matrix44) {
        Private.debugMaterial.applyParameter("ambient", color);

        // TODO support oriented bbs in CollisionUtils
        let position = Vector3.fromPool();
        let rotation = Quaternion.fromPool();
        let scale = Vector3.fromPool();
        worldMatrix.decompose(position, rotation, scale);     
        let rotatedCenter = Vector3.fromPool().copy(box.center).rotate(rotation);   
        position.add(rotatedCenter);
        scale.x *= box.extent.x;
        scale.y *= box.extent.y;
        scale.z *= box.extent.z;
        Private.modelViewMatrix.compose(position, rotation, scale);

        // let position = Vector3.fromPool();
        // let scale = Vector3.fromPool().copy(box.extent);
        // worldMatrix.decompose(position, Quaternion.dummy, Vector3.dummy);
        // position.add(box.center);
        // Private.modelViewMatrix.compose(position, Quaternion.identity, scale);

        Private.debugMaterial.applyParameter(
            "modelViewMatrix",
            Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, Private.modelViewMatrix));
        GraphicUtils.drawVertexBuffer(WebGL.context, defaultAssets.primitives.box.vertexBuffer, Private.debugMaterial.shader as Shader);
    }

    static drawSphere(center: Vector3, radius: number, color: Color, worldMatrix: Matrix44) {
        Private.debugMaterial.applyParameter("ambient", color);
        let position = Vector3.fromPool();
        let rotation = Quaternion.fromPool();
        let scale = Vector3.fromPool();
        worldMatrix.decompose(position, rotation, scale);
        let rotatedCenter = Vector3.fromPool().copy(center).rotate(rotation);
        position.add(rotatedCenter);
        scale.multiply(radius);
        Private.modelViewMatrix.compose(position, rotation, scale);
        Private.debugMaterial.applyParameter(
            "modelViewMatrix",
            Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, Private.modelViewMatrix));
        GraphicUtils.drawVertexBuffer(WebGL.context, defaultAssets.primitives.sphere.vertexBuffer, Private.debugMaterial.shader as Shader);
    }

    static drawPlane(normal: Vector3, distToOrigin: number, color: Color, worldMatrix: Matrix44) {        
        let { basis } = Private;
        basis.setFromNormal(normal);
        const size = 9999;
        basis.right.multiply(size);
        basis.forward.multiply(size);
        let position = Vector3.fromPool();
        let rotation = Quaternion.fromPool();
        let worldNoScale = Matrix44.fromPool()
            .copy(worldMatrix)
            .decompose(position, rotation, Vector3.dummy)        
            .compose(position, rotation, Vector3.one);
        let centerPoint = Vector3.fromPool().copy(normal).multiply(distToOrigin);
        let topLeft = Vector3.fromPool().copy(centerPoint).add(basis.forward).substract(basis.right);
        let topRight = Vector3.fromPool().copy(centerPoint).add(basis.forward).add(basis.right);
        let botLeft = Vector3.fromPool().copy(centerPoint).substract(basis.forward).substract(basis.right);
        let botRight = Vector3.fromPool().copy(centerPoint).substract(basis.forward).add(basis.right);
        this.drawQuad(topLeft, topRight, botLeft, botRight, color, worldNoScale);
    }

    static draw2DRect(minX: number, minY: number, maxX: number, maxY: number, color: Color, matrix: Matrix44) {
        Private.debugMaterial.applyParameter("ambient", color);
        Private.debugMaterial.applyParameter("modelViewMatrix", Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, matrix));
        let data = Private.rect.data.position;
        data[0] = minX; data[1] = minY; data[2] = 0;
        data[3] = maxX; data[4] = minY; data[5] = 0;
        data[6] = maxX; data[7] = maxY; data[8] = 0;
        data[9] = minX; data[10] = maxY; data[11] = 0;
        data[12] = minX; data[13] = minY; data[14] = 0;
        Private.rect.dirtifyData("position");
        GraphicUtils.drawVertexBuffer(WebGL.context, Private.rect, Private.debugMaterial.shader as Shader);
    }

    static draw2DCross(x: number, y: number, size: number, color: Color, matrix: Matrix44) {
        Private.debugMaterial.applyParameter("ambient", color);
        Private.debugMaterial.applyParameter("modelViewMatrix", Private.modelViewMatrix.multiplyMatrices(Private.viewMatrix, matrix));
        let data = Private.line.data.position;
        data[0] = x - size; data[1] = y; data[2] = 0;
        data[3] = x + size; data[4] = y; data[5] = 0;
        Private.line.dirtifyData("position");
        GraphicUtils.drawVertexBuffer(WebGL.context, Private.line, Private.debugMaterial.shader as Shader);
        data[0] = x; data[1] = y - size; data[2] = 0;
        data[3] = x; data[4] = y + size; data[5] = 0;
        Private.line.dirtifyData("position");
        GraphicUtils.drawVertexBuffer(WebGL.context, Private.line, Private.debugMaterial.shader as Shader);
    }
}
