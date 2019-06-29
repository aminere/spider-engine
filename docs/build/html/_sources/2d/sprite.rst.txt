
.. _sprite:

======
Sprite
======

Sprites give more precise control over the geometry of 2D elements.

They are 9-Patch images that support tiling patterns while keeping a minimal usage of textures.

For example, this small texture |dirt| can be used as a Sprite to achieve the dirt marks in this sequence:

    .. image:: ./images/dirt.gif
    
.. |dirt| image:: ./images/dirt.png

To create a Sprite, click on the Create Button |create_button| in the :ref:`Assets View <assets-view>` and select **Sprite**.

Sprite properties
=================

Texture
-------

The texture used by the Sprite.

Border Size
-----------

The border around the sprite, that the defines the structure of the 9 Patches.

    .. image:: ./images/border.png

For example, the following super tiny texture |dialog|, with a border of **(4, 4)** can produce a dialog box of any size:

    .. image:: ./images/dialog.gif
        :scale: 70%

.. |dialog| image:: ./images/dialog.png

Render Mode
-----------

Specifies how the middle of the Sprite is presented.

* **Tile**

    .. image:: ./images/sprite-tiling.png

* **Stretch**

    .. image:: ./images/sprite-stretching.png

.. |create_button| image:: ../images/create_button.png
