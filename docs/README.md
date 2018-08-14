
# Spider Engine

Spider is a web-based creation environment, based on HTML5 and WebGL.

## Entities and Components

Spider uses the Entity Component pattern to build functionality.

An Entity is a unique object that is part of a scene. What an entity does is entirely defined by its components.

For example, and Entity displays a **Button** if it has a [Button Component](components.md).

An Entity can have other entities as its children.

See [Component Reference](components.md)

## Scenes

A Scene is a hierarchy of entities. Only one scene can be open at a time.

Typically, a scene represents an independent area of your program.

You can switch scenes using the [Behavior](/behavior/) system. After a scene switch is completed, the previous scene is unloaded from memory.

## Assets

Assets are persistent objects. They are typically referenced by components to configure functionality. For example, a **Visual** component references a **Material** asset.

> Assets may also reference each other, for example, a **Material** asset references a **Shader** asset.

See [Asset Reference](assets.md)

## Publishing

There are several ways to publish creations made with Spider.

* **Publish to web**

Your creation will receive a unique URL and will be playable on the web.
> Upon publishing to web, your creation will be listed on the Spider Engine [Projects Page](https://spiderengine.io/projects).

* **Publish to disk**

You can download your creation to disk. You should typically do this if you want to host it on your own web server. 

* **Natives platforms**

It is possible to publish to iOS, Android, and desktop platforms. (Coming Soon)
