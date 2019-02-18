========
Overview
========

Entities and Components
=======================

Spider uses the Entity Component pattern to build functionality.

An Entity is the building block of a :ref:`Scene <scenes>`. Its appearance and behavior are defined by its components.

For example, and Entity looks and acts like a Button if it has a :ref:`Button Component <button-component>`.

An Entity may have children entities.


.. _scenes:

Scenes
======

A Scene is a hierarchy of entities. Only one scene can be open at a time.

A scene represents an independent area of your program.

You can load and switch scenes using :ref:`Behaviors <behaviors>`. 

.. note::

	After a scene switch is completed, the previous scene is unloaded from memory.

Publishing
==========

There are several ways to publish creations made with Spider.

Publish to `spiderengine.io <https://spiderengine.io>`_
------------------------------------------------------------

Your creation will receive a unique URL and will be playable on the web.

.. note::

	Upon publishing to web, your creation will be listed on Spider Engine's `Projects Page <https://spiderengine.io/projects>`_.

Publish to a Private Web Server
-------------------------------

You can publish to disk using the `Spider Editor <https://spiderengine.io/editor>`_ and obtain the data necessary to host your creation on your server.

Native Platforms
----------------

Support for PC, Mac, iOS and Android platforms is coming soon!
