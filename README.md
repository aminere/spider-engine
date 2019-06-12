Spider Engine
=============

![Thumbnails](https://raw.githubusercontent.com/aminere/spider-engine/master/docs/source/images/runtime.jpg)

Spider is a fast game engine, ideal for prototyping in your web browser.

It is composed of an open source run-time and an editor front-end.

* [Playground](https://playground.spiderengine.io)
* [Projects](https://spiderengine.io/projects)
* [Documentation](https://docs.spiderengine.io/) 
* [API reference](https://docs.spiderengine.io/api)
* [Editor Frontend](https://spiderengine.io/editor)
* [Forum](https://forum.spiderengine.io)

Quick Start
-----------

**NPM (Recommended)**

Use `create-spider-engine-app` to make a minimalist project, pre-configured with a typescript stack.

```bash
npx create-spider-engine-app my-app
cd my-app
npm start
```

**Example Usage**

The following displays a rotating box on screen:

```javascript
// shader
const shader = new spider.Shader({
    vertexCode: `                
attribute vec3 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
    fragmentCode: `
precision mediump float;
void main() {    
    gl_FragColor = vec4(1.);
}
`
});

// Camera
spider.Entities.create()
    .setComponent(spider.Camera)
    .setComponent(spider.Transform, {
        position: new spider.Vector3(0, 0, 4)
    });

// Box
const box = spider.Entities.create().setComponent(spider.Visual, {
    material: new spider.Material({ shader }),
    geometry: new spider.BoxGeometry()
});

// Update callback
spider.Update.hook.attach(() => {
    box.updateComponent(spider.Transform, {
        rotation: spider.Quaternion.fromEulerAngles(
            spider.Time.time,
            spider.Time.time,
            0
        )
    });
});
```
