
.. _material:

========
Material
========

Materials provide all information necessary to shade elements on the screen.

To create a Material, click on the Create Button |create_button| in the :ref:`Assets View <assets-view>` and select **Material**.

Material Properties
===================

Blending
--------

Blending is disabled by default. If you need Transparent elements, you should turn it on.

* **None** (default)
* **Linear**
* **Additive**

Cull Mode
---------

* **CounterClockWise** (default)
* **ClockWise**
* **None**

Depth Testing
-------------

Depth testing is enabled by default. You can turn it off for objects that you want to always appear on screen, regardless of what's in front of them.

Render Pass
-----------

These are built-in passes in the 3D graphics renderer. They are not customizable for now.

1. Opaque Pass: Use for opaque objects. Depth testing and writing is enabled in this pass.

2. Transparent Pass: Use for transparents. Depth writing is disabled in this pass.

.. _shader:

Shader
------

Shaders give you an opportunity to customize how elements are drawn on the screen.

Each shader contains vertex and fragment programs that you can develop using `GLSL <https://www.khronos.org/opengles/sdk/docs/manglsl/docbook4/>`_.

To create a Shader, click on the Create Button |create_button| in the :ref:`Assets View <assets-view>` and select **Shader**.

.. |create_button| image:: ../images/create_button.png
