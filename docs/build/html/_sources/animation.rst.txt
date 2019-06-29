
.. _animation:

=========
Animation
=========

Spider's Animation system can accomplish a wide-range of functionality:

* Visual effects (by animating material properties)
* Skinned character animation
* Transform animation (Position / Rotation / Scale)
* Generic animation of any Entity property

.. image:: ./animation/timeline.gif

.. _animation-create:

Creating an Animation
=====================

The recommended work-flow is to select an Entity and click on the Animate Button |animate| in the :ref:`Properties View <properties-view>`.

Under the hood, the Editor will add an **AnimationComponent** to your Entity, create an **Animation** asset, and link them together.

.. note::

    Alternatively, you can manually create an Animation in the Assets View, and assign it to your Entity through an AnimationComponent.

Animation Component
===================

It's responsible for animating its Entity.

It defines a list of **Animation Instances** that can be played in parallel.

Animation Instance
==================

Defines how an animation is applied to an Entity. It has the following properties:

Loop Count
----------

The number of times an animation is repeated.

If less than or equal 0, the animation is repeated indefinitely.

Speed
-----

A factor that affects how fast the animation is played.

Auto Play
---------

Determines if the animation starts playing as soon as the Entity is created.

Animation
---------

The animation asset holding the actual animation data.

It can be shared across multiple Animation Instances.

In most cases, you don't need to set this manually, it's set by the Editor when using the :ref:`Animation Creation Work-flow <animation-create>`.

Editing an Animation
====================

The Animation Timeline lets you manipulate Animation Tracks and Animation Keys.

.. image:: ./animation/timeline.png

.. |animate| image:: ./images/animate.png
