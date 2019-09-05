
import { UniqueObject } from "./UniqueObject";
import { Projector } from "../graphics/Projector";
import { Asset } from "../assets/Asset";
import { Geometry } from "../graphics/geometry/Geometry";
import { Camera } from "../graphics/Camera";
import { OrthographicProjector } from "../graphics/OrthographicProjector";
import { PerspectiveProjector } from "../graphics/PerspectiveProjector";
import { CenteredQuad } from "../graphics/geometry/CenteredQuad";
import { Material } from "../graphics/Material";
import { Texture } from "../graphics/Texture";
import { SerializableObject } from "./SerializableObject";
import { Behavior } from "../behavior/Behavior";
import { Operator } from "../behavior/Operator";
import { Connection } from "../behavior/Connection";
import { PinReference, BasePin, SignalPin, DataPin } from "../behavior/Pin";
import { BehaviorOperator } from "../behavior/operators/BehaviorOperator";
import { CodeBlockInstance } from "../behavior/operators/CodeBlockInstance";
import { 
    NumberPin, 
    StringPin, 
    BooleanPin, 
    Vector2Pin, 
    Vector3Pin, 
    Vector4Pin, 
    ColorPin,    
    EntityReferencePin, 
    ComponentReferencePin,    
    CollisionInfoPin,
    ArrayPin,
    AssetPin,
    PrefabPin,
    ObjectReferencePin,
    RayPin
} from "../behavior/DataPins";
import { BehaviorComponent } from "../behavior/BehaviorComponent";
import { Shader } from "../graphics/Shader";
import { Visual } from "../graphics/Visual";

import { Delay } from "../behavior/operators/Delay";
import { CodeBlock } from "../behavior/CodeBlock";

import { StaticMesh } from "../graphics/geometry/StaticMesh";
import { StaticMeshAsset } from "../assets/StaticMeshAsset";
import { Model } from "../assets/model/Model";
import { VisualGroup } from "../graphics/VisualGroup";
import { Scene } from "../assets/Scene";
import { Button } from "../ui/Button";
import { UIElement } from "../ui/UIElement";
import { Image } from "../ui/Image";
import { Text } from "../ui/UIText";
import { Screen } from "../ui/Screen";
import { Sprite } from "../ui/Sprite";
import { Layout } from "../ui/Layout";
import { UIFill, MaterialFill, SpriteFill, TextureFill, ColorFill, SpriteSheetFill, SpriteSheetMaterialFill } from "../ui/UIFill";

import { Entity } from "./Entity";
import { Prefab } from "../assets/Prefab";
import {
    AnimationTrack,
} from "../animation/tracks/AnimationTrack";

import { AnimationComponent } from "../animation/AnimationComponent";
import { Animation } from "../animation/Animation";
import { AnimationKey } from "../animation/keys/AnimationKey";
import { InlineVariable } from "../behavior/InlineVariable";
import { GraphicAsset } from "../graphics/GraphicAsset";
import { FontTexture } from "../ui/Font/FontTexture";
import { TouchInput } from "../behavior/operators/TouchInput";
import { KeyInput } from "../behavior/operators/KeyInput";
import { StaticCubemap } from "../graphics/StaticCubemap";
import { ParticlesGeometry } from "../graphics/geometry/ParticlesGeometry";
import { Volume } from "../graphics/volumes/Volume";
import { SphereVolume } from "../graphics/volumes/SphereVolume";
import { BoxVolume } from "../graphics/volumes/BoxVolume";
import { Billboard } from "../graphics/geometry/Billboard";
import { Light, LightType, DirectionalLight } from "../graphics/lighting/Light";
import { QuadGeometry } from "../graphics/geometry/QuadGeometry";
import { RenderTarget } from "../graphics/RenderTarget";
import { Texture2D } from "../graphics/Texture2D";
import { BehaviorNode } from "../behavior/BehaviorNode";
import { Converter } from "../behavior/Converter";
import { Vector2Converter } from "../behavior/converters/Vector2Converter";
import { ScreenToRay } from "../behavior/converters/ScreenToRay";
import { RayCastOnPlane } from "../behavior/converters/RayCastOnPlane";
import { 
    ParticleValueOverLife, 
    ParticleNumberOverLife, 
    ParticleColorOverLife,    
    Particles 
} from "../graphics/Particles";
import { Collider } from "../collision/Collider";
import { CollisionShape } from "../collision/CollisionShape";
import { SphereCollisionShape } from "../collision/SphereCollisionShape";
import { BoxCollisionShape } from "../collision/BoxCollisionShape";
import { ParticlesCollisionShape } from "../collision/ParticlesCollisionShape";
import { Collision } from "../behavior/operators/Collision";
import { SkinnedMesh } from "../graphics/geometry/SkinnedMesh";
import { SpriteGeometry } from "../graphics/geometry/SpriteGeometry";
import { UIEvents } from "../behavior/operators/UIEvents";
import { ObjectDeclaration } from "../behavior/ObjectDeclaration";
import { ObjectDefinition } from "../behavior/ObjectDefinition";
import { Data } from "../behavior/DataComponent";
import { SpriteSheet } from "../ui/SpriteSheet";
import { CodeBlockConverterInstance } from "../behavior/operators/CodeBlockConverterInstance";
import { CodeBlockConverter } from "../behavior/CodeBlockConverter";
import { Environment, ColorEnvironment, SkySimulation, SkyBoxEnvironment } from "../graphics/Environment";
import { EngineSettings } from "./EngineSettings";
import { Font } from "../ui/Font/Font";
import { BitmapFont } from "../ui/Font/BitmapFont";
import { MemoryTexture } from "../graphics/MemoryTexture";
import { Bone } from "./Bone";
import { DynamicGeometry } from "../graphics/geometry/DynamicGeometry";
import { RigidBody } from "../physics/RigidBody";
import { PhysicsContext } from "../physics/PhysicsContext";
import { MeshCollisionShape } from "../collision/MeshCollisionShape";
import { PlaneCollisionShape } from "../collision/PlaneCollisionShape";
import { Fog, LinearFog, ExponentialFog } from "../graphics/Fog";
import { PhongShader } from "../graphics/shading/PhongShader";
import { PostEffects, Bloom, FastBloom, Desaturate, FastDesaturate } from "../graphics/postfx/PostEffects";
import { VisualCollisionShape } from "../collision/VisualCollisionShape";
import { CollisionGroup } from "../collision/CollisionGroup";
import { GamepadRecorder } from "../behavior/operators/GamepadRecorder";
import { GamepadData } from "../assets/GamepadData";
import { DrawableTexture } from "../graphics/DrawableTexture";
import { Raytracer } from "../graphics/Raytracer";
import { Resolution, CustomResolution } from "../ui/Resolution";
import { TouchInteractions } from "../ui/TouchInteractions";
import { FontFamily } from "../ui/Font/FontFamily";
import { FontMetrics } from "../ui/Font/FontMetrics";
import { FontShadow, DefaultFontShadow } from "../ui/Font/FontShadow";
import { HudControl, HudNumber, HudBoolean } from "./hud/EngineHud";
import { Proxy } from "./Proxy";
import { CheckBox } from "../ui/CheckBox";
import { AnimationInstance } from "../animation/AnimationInstance";
import { Component } from "./Component";
import { Transform } from "./Transform";
import { NumberKey, BooleanKey, StringKey } from "../animation/keys/NativeKey";
import { ColorKey } from "../animation/keys/ColorKey";
import { AssetKey } from "../animation/keys/AssetKey";
import { AnimationSubTrackDefinition, CompositeTrack } from "../animation/tracks/CompositeTrack";
import { NumberTrack } from "../animation/tracks/NumberTrack";
import { BooleanTrack, StringTrack } from "../animation/tracks/SingleTrack";
import { AssetTrack } from "../animation/tracks/AssetTrack";
import { ColorTrack } from "../animation/tracks/ColorTrack";
import { RotationTrack } from "../animation/tracks/RotationTrack";
import { AnimationTrackDefinition } from "../animation/AnimationTrackDefinition";
import { IFactoryInternal } from "../serialization/IFactory";
import { ParticleShape } from "../graphics/particles/ParticleShape";
import { MeshParticle } from "../graphics/particles/MeshParticle";
import { BillboardParticle } from "../graphics/particles/BillboardParticle";
import { BoxGeometry } from "../graphics/geometry/primitives/BoxGeometry";
import { SphereGeometry } from "../graphics/geometry/primitives/SphereGeometry";
import { PlaneGeometry } from "../graphics/geometry/primitives/PlaneGeometry";
import { ConeGeometry } from "../graphics/geometry/primitives/ConeGeometry";
import { IKNode } from "../animation/ik/IKNode";
import { IKConstraint } from "../animation/ik/IKConstraints";
import { IKFootSolver } from "../animation/ik/IKFootSolver";
import { IKGenericSolver, BaseRotation } from "../animation/ik/IKGenericSolver";
import { IKSolver } from "../animation/ik/IKSolver";
import { IKEffector } from "../animation/ik/IKEffector";
import { IKSolverBase } from "../animation/ik/IKSolverBase";
import { AnimationTransition } from "../animation/AnimationTransition";
import { CollisionFilter, InclusionCollisionFilter, ExclusionCollisionFilter } from "../collision/CollisionFilter";
import { CharacterCollider } from "../collision/CharacterCollider";
import { VisualFilter } from "../graphics/VisualFilter";
import { ModelElement } from "../assets/model/ModelElement";
import { ModelMesh } from "../assets/model/ModelMesh";
import { ModelSkinnedMesh } from "../assets/model/ModelSkinnedMesh";
import { ModelBone } from "../assets/model/ModelBone";
import { ModelMultiMesh, ModelSubMesh } from "../assets/model/ModelMultiMesh";
import { InclusionVisualFilter, ExclusionVisualFilter } from "../graphics/VisualFilters";
import * as html from "../ui/Html";
import { Css } from "../ui/Css";

/**
 * @hidden
 */
export class TypeRegistration {
    static registerDefaultTypes() {
        const factory = IFactoryInternal.instance;

        // Core
        factory.registerObject(SerializableObject);
        factory.registerObject(UniqueObject, SerializableObject);
        factory.registerObject(Entity, UniqueObject);
        factory.registerObject(Projector, SerializableObject);
        factory.registerObject(Asset, UniqueObject);        
        factory.registerObject(Scene, Asset);
        factory.registerObject(Prefab, Asset);
        factory.registerObject(Component, SerializableObject, true);
        factory.registerObject(Transform, Component);        
        factory.registerObject(Camera, Component);
        factory.registerObject(Bone, Component);
        factory.registerObject(OrthographicProjector, Projector);
        factory.registerObject(PerspectiveProjector, Projector);      
        factory.registerObject(EngineSettings, UniqueObject);         
        factory.registerObject(Proxy, Component);
        factory.registerObject(HudControl, SerializableObject);
        factory.registerObject(HudNumber, HudControl);
        factory.registerObject(HudBoolean, HudControl);

        // Rendering
        factory.registerObject(Visual, Component);
        factory.registerObject(Geometry, SerializableObject);
        factory.registerObject(CenteredQuad, Geometry);
        factory.registerObject(QuadGeometry, Geometry);
        factory.registerObject(StaticMesh, Geometry);
        factory.registerObject(SkinnedMesh, StaticMesh);
        factory.registerObject(Billboard, Geometry);
        factory.registerObject(SpriteGeometry, Geometry);             
        factory.registerObject(DynamicGeometry, Geometry);
        factory.registerObject(BoxGeometry, Geometry);
        factory.registerObject(SphereGeometry, Geometry);
        factory.registerObject(PlaneGeometry, Geometry);
        factory.registerObject(ConeGeometry, Geometry);
        factory.registerObject(VisualGroup, Asset);
        factory.registerObject(Material, Asset);
        factory.registerObject(GraphicAsset, Asset);
        factory.registerObject(Shader, GraphicAsset);
        factory.registerObject(PhongShader, Shader);
        factory.registerObject(Texture, GraphicAsset);
        factory.registerObject(Texture2D, Texture);
        factory.registerObject(RenderTarget, Texture);
        factory.registerObject(FontTexture, Texture);       
        factory.registerObject(MemoryTexture, Texture);    
        factory.registerObject(DrawableTexture, Texture);    
        factory.registerObject(StaticCubemap, GraphicAsset);
        factory.registerObject(StaticMeshAsset, GraphicAsset);
        factory.registerObject(Model, Asset);
        factory.registerObject(ModelElement, UniqueObject);
        factory.registerObject(ModelMesh, ModelElement);
        factory.registerObject(ModelMultiMesh, ModelElement);
        factory.registerObject(ModelSubMesh, SerializableObject);
        factory.registerObject(ModelSkinnedMesh, ModelMesh);        
        factory.registerObject(ModelBone, ModelElement);        
        factory.registerObject(Volume, SerializableObject);
        factory.registerObject(SphereVolume, Volume);
        factory.registerObject(BoxVolume, Volume);
        factory.registerObject(Light, Component);
        factory.registerObject(LightType, SerializableObject);
        factory.registerObject(DirectionalLight, LightType);
        // factory.registerObject(PointLight, LightType);
        factory.registerObject(ParticleValueOverLife, SerializableObject);   
        factory.registerObject(ParticleNumberOverLife, ParticleValueOverLife);   
        factory.registerObject(ParticleColorOverLife, ParticleValueOverLife);
        factory.registerObject(Environment, SerializableObject);
        factory.registerObject(ColorEnvironment, Environment);
        factory.registerObject(SkySimulation, Environment);
        factory.registerObject(SkyBoxEnvironment, Environment);        
        factory.registerObject(Fog, SerializableObject);
        factory.registerObject(LinearFog, Fog);
        factory.registerObject(ExponentialFog, Fog);
        factory.registerObject(PostEffects, SerializableObject);
        factory.registerObject(Bloom, SerializableObject);
        factory.registerObject(FastBloom, Bloom);
        factory.registerObject(Desaturate, SerializableObject);
        factory.registerObject(FastDesaturate, Desaturate);
        factory.registerObject(Raytracer, Component);
        factory.registerObject(VisualFilter, SerializableObject);
        factory.registerObject(InclusionVisualFilter, VisualFilter);
        factory.registerObject(ExclusionVisualFilter, VisualFilter);

        // Particles
        factory.registerObject(Particles, Component);
        factory.registerObject(ParticlesGeometry, Geometry);
        factory.registerObject(ParticleShape, SerializableObject);
        factory.registerObject(BillboardParticle, ParticleShape);
        factory.registerObject(MeshParticle, ParticleShape);
        
        // Physics / Collision
        factory.registerObject(Collider, Component);       
        factory.registerObject(CharacterCollider, Component);
        factory.registerObject(CollisionGroup, Asset);
        factory.registerObject(CollisionShape, SerializableObject);
        factory.registerObject(SphereCollisionShape, CollisionShape);
        factory.registerObject(BoxCollisionShape, CollisionShape);
        factory.registerObject(ParticlesCollisionShape, CollisionShape);
        factory.registerObject(MeshCollisionShape, CollisionShape);
        factory.registerObject(VisualCollisionShape, CollisionShape);        
        factory.registerObject(PlaneCollisionShape, CollisionShape);
        factory.registerObject(CollisionInfoPin, DataPin);        
        factory.registerObject(PhysicsContext, Component);
        factory.registerObject(RigidBody, Component);
        factory.registerObject(CollisionFilter, SerializableObject, true);
        factory.registerObject(InclusionCollisionFilter, CollisionFilter);
        factory.registerObject(ExclusionCollisionFilter, CollisionFilter);

        // UI
        factory.registerObject(UIElement, Component);
        factory.registerObject(TouchInteractions, Component);        
        factory.registerObject(Layout, Component);
        factory.registerObject(Button, UIElement);
        factory.registerObject(CheckBox, UIElement);
        factory.registerObject(Image, UIElement);
        factory.registerObject(Text, UIElement);
        factory.registerObject(Screen, Component);        
        factory.registerObject(Sprite, Asset);
        factory.registerObject(SpriteSheet, Asset);        
        factory.registerObject(UIFill, SerializableObject);
        factory.registerObject(MaterialFill, UIFill);
        factory.registerObject(SpriteFill, UIFill);
        factory.registerObject(TextureFill, UIFill);
        factory.registerObject(ColorFill, UIFill);
        factory.registerObject(SpriteSheetFill, UIFill);
        factory.registerObject(SpriteSheetMaterialFill, SpriteSheetFill);        
        factory.registerObject(UIEvents, BehaviorNode);
        factory.registerObject(Font, SerializableObject);
        factory.registerObject(FontShadow, SerializableObject);
        factory.registerObject(DefaultFontShadow, FontShadow);
        factory.registerObject(FontFamily, Font);
        factory.registerObject(BitmapFont, Font);
        factory.registerObject(FontMetrics, Asset);
        factory.registerObject(Resolution, SerializableObject);
        factory.registerObject(CustomResolution, Resolution);
        factory.registerObject(html.Html, Component);
        factory.registerObject(html.Content, SerializableObject);
        factory.registerObject(html.InnerHtml, html.Content);
        factory.registerObject(html.InnerText, html.Content);
        factory.registerObject(html.KeyValue, SerializableObject);
        factory.registerObject(Css, Component);

        // Behavior
        factory.registerObject(ObjectDeclaration, Asset);
        factory.registerObject(ObjectDefinition, Asset);
        factory.registerObject(BehaviorComponent, Component);
        factory.registerObject(Data, Component);        
        factory.registerObject(Behavior, Asset);        
        factory.registerObject(BehaviorNode, SerializableObject);
        factory.registerObject(Operator, BehaviorNode);
        factory.registerObject(Converter, BehaviorNode);     
        factory.registerObject(CodeBlockConverterInstance, Converter);
        factory.registerObject(Connection, SerializableObject);
        factory.registerObject(BehaviorOperator, Operator);
        factory.registerObject(CodeBlockInstance, Operator);
        factory.registerObject(Collision, BehaviorNode);        
        factory.registerObject(CodeBlock, Asset);
        factory.registerObject(CodeBlockConverter, CodeBlock);        
        factory.registerObject(InlineVariable, SerializableObject);
        factory.registerObject(PinReference, SerializableObject);
        factory.registerObject(BasePin, SerializableObject);
        factory.registerObject(SignalPin, BasePin);
        factory.registerObject(DataPin, BasePin, true);
        factory.registerObject(NumberPin, DataPin);
        factory.registerObject(StringPin, DataPin);
        factory.registerObject(BooleanPin, DataPin);
        factory.registerObject(Vector2Pin, DataPin);
        factory.registerObject(Vector3Pin, DataPin);
        factory.registerObject(RayPin, DataPin);
        factory.registerObject(Vector4Pin, DataPin);
        factory.registerObject(ColorPin, DataPin);
        factory.registerObject(EntityReferencePin, DataPin); 
        factory.registerObject(ComponentReferencePin, DataPin);
        factory.registerObject(AssetPin, DataPin);
        factory.registerObject(PrefabPin, DataPin);
        factory.registerObject(ArrayPin, DataPin);
        factory.registerObject(ObjectReferencePin, DataPin);        
        
        // Animation
        factory.registerObject(Animation, Asset);
        factory.registerObject(AnimationTransition, Asset);
        factory.registerObject(AnimationTrack, SerializableObject);
        factory.registerObject(AnimationKey, SerializableObject);
        factory.registerObject(AnimationTrackDefinition, SerializableObject);
        factory.registerObject(AnimationSubTrackDefinition, SerializableObject);
        factory.registerObject(CompositeTrack, AnimationTrack);
        factory.registerObject(NumberTrack, AnimationTrack);
        factory.registerObject(BooleanTrack, AnimationTrack);
        factory.registerObject(StringTrack, AnimationTrack);
        factory.registerObject(AssetTrack, AnimationTrack);
        factory.registerObject(ColorTrack, AnimationTrack);
        factory.registerObject(RotationTrack, CompositeTrack);
        factory.registerObject(NumberKey, AnimationKey);
        factory.registerObject(BooleanKey, AnimationKey);
        factory.registerObject(StringKey, AnimationKey);
        factory.registerObject(ColorKey, AnimationKey);
        factory.registerObject(AssetKey, AnimationKey);
        factory.registerObject(AnimationComponent, Component);
        factory.registerObject(AnimationInstance, SerializableObject);
        factory.registerObject(IKSolver, Component);
        factory.registerObject(IKSolverBase, SerializableObject);
        factory.registerObject(IKGenericSolver, IKSolverBase);
        factory.registerObject(IKFootSolver, IKSolverBase);
        factory.registerObject(IKEffector, Component);        
        factory.registerObject(IKNode, Component);
        factory.registerObject(IKConstraint, SerializableObject);
        factory.registerObject(BaseRotation, SerializableObject);

        // Custom Behavior Nodes
        factory.registerObject(Delay, Operator);
        factory.registerObject(KeyInput, BehaviorNode);
        factory.registerObject(TouchInput, BehaviorNode);        
        factory.registerObject(RayCastOnPlane, Converter);
        factory.registerObject(ScreenToRay, Converter);
        factory.registerObject(Vector2Converter, Converter);
        factory.registerObject(GamepadRecorder, Operator);
        factory.registerObject(GamepadData, Asset);
    }
}
