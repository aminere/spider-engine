
======
Visual
======

The Visual component is the pillar of the rendering pipeline. 

It defines a geometry and its corresponding material.

Visual Properties
=================

Cast Shadows
------------

* **On** (default)
* **Off**

Receive Shadows
---------------

* **On** (default)
* **Off**

Receive Fog
-----------

* **On** (default)
* **Off**

Group
-----

Groups are used to differentiate visuals during the rendering process.

A typical usage is when you have multiple cameras in the scene, and you want to define which groups are seen by which camera.

To create a Visual group, click on the Create Button |create_button| in the :ref:`Assets View <assets-view>` and select **Visual Group**.

Geometry
--------

    * **Centered Quad**

    * **Quad**

    * **Static Mesh**: Represents a static mesh. You rarely need to set this manually, see :ref:`Adding a Model to a Scene <add-model>`.

    * **Skinned Mesh**: Represents an animated, skinned mesh. You rarely need to set this manually, see :ref:`Adding a Model to a Scene <add-model>`.

    * **Billboard**: See :ref:`Billboard <billboard>`

    * **Sprite Geometry**: Renders a geometry based on a Sprite. This is ideal if you need 2D sprites in the 3D world, for example in an AR-like UI.

    * **Dynamic Geometry**: Useful for procedural mesh generation at run-time. It is completely transient and not saved anywhere.

Material
--------

See :ref:`Material <material>`

.. |create_button| image:: ../images/create_button.png
