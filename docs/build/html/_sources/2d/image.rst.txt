
.. _image:

=====
Image
=====

Images are the main way to draw 2D elements on screen.

To create an Image, click on the Insert Button |insert_button| in the `Editor <https://spiderengine.io/editor>`_ and select **Image**.

A quick way of creating an image is by right-clicking on a :ref:`Texture <texture>`, :ref:`Sprite <sprite>`, or :ref:`Sprite Sheet <sprite-sheet>`, in the :ref:`Assets View <assets-view>`, and selecting Add to Scene |add_to_scene|

Image Properties
================

.. _ui-fill:

Fill
----

* **Color**: A simple colored quad.	

* **Texture**: A simple textured quad.	

* **Material**: A quad using a custom material. This is typically needed to handle more complex visuals, when the capabilities of the standard 2D diffuse shader are not enough.

* **Sprite**: Draws a :ref:`Sprite <sprite>`.

* **SpriteSheet**: Draws a tile of a :ref:`Sprite Sheet <sprite-sheet>`, specified by the **Current Tile** property.	

* **SpriteSheet Material**: Same as a SpriteSheet, but with a custom material.

Color
-----

Tints the Image using a color multiply.

.. |insert_button| image:: ../images/insert_button.png
.. |add_to_scene| image:: ../images/add_to_scene.png
