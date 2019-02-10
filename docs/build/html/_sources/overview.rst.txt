========
Overview
========

Entities and Components
=======================

Spider uses the Entity Component pattern to build functionality.

An Entity is a unique object that is part of a scene. An entity's functionality is entirely defined by its components.

For example, and Entity displays a Button if it has a :ref:`Button Component <components>`.

An Entity may have children entities.

See :ref:`Components <components>`.

Scenes
======

A Scene is a hierarchy of entities. Only one scene can be open at a time.

Typically, a scene represents an independent area of your program.

You can switch scenes using :ref:`Behaviors <behaviors>`. After a scene switch is completed, the previous scene is unloaded from memory.

Publishing
==========

There are several ways to publish creations made with Spider.

Publish to web
--------------

Your creation will receive a unique URL and will be playable on the web.

.. note::

	Upon publishing to web, your creation will be listed on the Spider Engine `Projects Page <https://spiderengine.io/projects>`_.

Publish to disk
---------------

You can download your creation to disk. You should typically do this if you want to host it on your own web server.

Native platforms
----------------

It is possible to publish to iOS, Android, and desktop platforms. (Coming Soon)
