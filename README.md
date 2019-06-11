Spider Engine
=============

![Thumbnails](https://raw.githubusercontent.com/aminere/spider-engine/master/docs/source/images/runtime.jpg)

Spider is a fast game engine for the web, composed of an open source run-time and an editor front-end.

* [Playground](https://playground.spiderengine.io)
* [Projects](https://spiderengine.io/projects)
* [Documentation](https://docs.spiderengine.io/) 
* [API reference](https://docs.spiderengine.io/api)
* [Editor](https://spiderengine.io/editor)
* [Forum](https://forum.spiderengine.io)

Quick Start
-----------

**NPM (Recommended)**

Use `create-spider-engine-app` to make a minimalist project, pre-configured with a typescript stack.

```
npx create-spider-engine-app my-app
cd my-app
npm start
```

**Example Usage**

The following displays a rotating box on screen:

```
// Box
const box = spider.Entities.create()
    .setComponent(spider.Visual, {
        material: new spider.Material({
            shader: spider.DefaultAssets.phongShader,
            shaderParams: {
                diffuse: spider.Color.white
            }
        }),
        geometry: new spider.BoxGeometry(),
        receiveShadows: false
    });

// Camera
spider.Entities.create()
    .setComponent(spider.Camera)
    .setComponent(spider.Transform, {
        position: new spider.Vector3(0, 0, 4)
    });

// Light
spider.Entities.create()
    .setComponent(spider.Light, {
        "type": new spider.DirectionalLight()
    })
    .setComponent(spider.Transform, {
        rotation: spider.Quaternion.fromEulerAngles(
            spider.MathEx.toRadians(-15),
            spider.MathEx.toRadians(30),
            0
        )
    });

const angles = new spider.Vector3();

// Update callback
spider.Update.hook.attach(() => {
    box.updateComponent(spider.Transform, {
        rotation: spider.Quaternion.fromEulerAngles(
            spider.MathEx.toRadians(angles.x),
            spider.MathEx.toRadians(angles.y),
            spider.MathEx.toRadians(angles.z)
        )
    });
    angles.x = 30 * Math.sin(spider.Time.time);
    angles.y += 120 * spider.Time.deltaTime * Math.sin(spider.Time.time / 4);
});

```
