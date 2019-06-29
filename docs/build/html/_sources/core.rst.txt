
=============
Core Concepts
=============

Entities and Components
=======================

Spider uses the Entity Component pattern to build functionality.

An Entity is the building block of a :ref:`Scene <scene>`. Its appearance and behavior are defined by its components.

An Entity may have children entities.

Creating an Entity
------------------

To create an Entity, click on the Insert Button |insert_button| in the `Editor <https://spiderengine.io/editor>`_.

.. |insert_button| image:: ./images/insert_button.png

Adding Functionality
--------------------

You can add functionality to an Entity by adding components to it.

* Select the Entity in the :ref:`Scene View <scene-view>` or the :ref:`Preview Area <preview-area>` 
* Click on Add Component |add_component| in the :ref:`Properties View <properties-view>`

.. |add_component| image:: ./images/add_component.png

Prefab
======

Prefabs are collections of Entities that make it easy to scale your project and re-use functionality.

To create a Prefab, right-click on an Entity in the :ref:`Scene View <scene-view>`, and select **Create Prefab**.

The Editor will create a corresponding Prefab asset, and link it to your Entity.

All the data describing your Entity will be moved from the Scene to the Prefab.

When an Entity is linked to a Prefab, the Editor shows a Prefab icon next to it:

	|prefab_instance|

.. |create_prefab| image:: ./images/create_prefab.png
.. |prefab_instance| image:: ./images/prefab_instance.png

Overriding
----------

It's possible to override Prefab information on a per Entity basis.

To do so, simply modify the Entity as you would normally.

When an Entity linked to a Prefab is overriden, the Editor shows a different Prefab icon next to it:

	|prefab_instance_overriden|

.. |prefab_instance_overriden| image:: ./images/prefab_instance_overriden.png

If you change your mind, you can reset the Entity to its Prefab state, by right-clicking and selecting **Revert to Prefab**.

.. |revert_to_prefab| image:: ./images/revert_to_prefab.png

Updating a Prefab
-----------------

You can apply all changes from an Entity back to its prefab by right-clicking and selecting **Apply to Prefab**.

.. note::

	This will affect all Entity instances using the same Prefab. Don't worry though, Prefab overrides in other Entity instances won't be lost.  

Detaching from a Prefab
-----------------------

You can detach an Entity from its Prefab by right-clicking and selecting **Detach from Prefab**.

.. _scene:

Scene
=====

Scenes represents an independent area of your game.

A Scene is a hierarchy of entities. Only one scene can be open at a time.

You can load and switch scenes using :ref:`Behaviors <behaviors>`

.. note::

	After a scene switch is completed, the previous scene is unloaded from memory.
