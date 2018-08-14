

# API Reference
The following functionality is accessible to any Code Block that is part of a Behavior.

## Engine
```javascript
Engine: {
    // Returns the deltatime in seconds
    deltaTime: () => number,

    // Returns the FPS
    fps: () => number,

    // Returns an Entity instance based on the provided prefab
    /**
      \param prefab: the prefab to instantiate
      \param worldPosition (optional): Used to initialize the Entity's position
      \return an Entity or null if the prefab could not be loaded.      
    */ 
    createFromPrefab: (prefab: Prefab, worldPosition?: Vector3) => Entity | null,

    // Loads a new scene asychronously  
    /**
      \param scenePath: Path to the new scene, for example: 'Assets/NewScene.Scene'
    */  
    loadScene: (scenePath: string) => void,

    // Returns the root entity.
    /**
      Only entities attached to the root are considered for update and rendering.
    */     
    root: () => Entity,

    // Removes and entity from the hierarchy and releases its resources.
    destroyEntity: (entity: Entity) => void,

    // Returs the real screen size in pixels
    getScreenSize: () => Vector2    
}
```

## Math

```javascript
Math: {
    PI: () => number,
    sin: (angleRadians: number) => number,
    cos: (angleRadians: number) => number,
    tan: (angleRadians: number) => number,
    sqrt: (value: number) => number,
    min: (a: number, b: number) => number,
    max: (a: number, b: number) => number,

    // Returns a random number between 0 and 1
    random: () => number,

    abs: (value: number) => number,
    sign: (value: number) => number,
    floor: (value: number) => number,
    ceil: (value: number) => number,
    toRadians: (angleDegrees: number) => number,
    toDegrees: (angleRadians: number) => number,
    clamp: (value: number, min: number, max: number) => number,
    degreesToRadians: () => number,
    radiansToDegrees: () => number,
    lerp: (a: number, b: number, k: number) => number
}
```