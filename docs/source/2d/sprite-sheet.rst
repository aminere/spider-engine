

.. _sprite-sheet:

============
Sprite Sheet
============

Sprite sheets are great for displaying visually different elements using a single texture, such as animated 2D characters.

In conjuntion with the :ref:`Animation <animation>` system, they are a powerful tool in creating games.

A sprite sheet is based on a texture that has a collection of similarily sized tiles:

    .. image:: ./images/firing.png

An example sequence made almost entirely with animated Sprite sheets:

    .. image:: ./images/sprite-sheet.gif

To create a Sprite sheet, click on the Create Button |create_button| in the :ref:`Assets View <assets-view>` and select **Sprite Sheet**.

Sprite sheet properties
=======================

Texture
-------

The texture used by the Sprite sheet.

Tile Size
---------

Specifies the size of individual tiles within the sheet.

Tile Count
----------

This is automatically set by the Editor, based on the specified Tile Size and the Texture dimensions. However, you can customize the Tile Count, in case you want only the first N number of tiles to be used from the Sprite sheet.

.. |create_button| image:: ../images/create_button.png
