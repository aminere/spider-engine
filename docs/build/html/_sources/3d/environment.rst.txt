
===========
Environment
===========

You can specify an Environment for each Scene.

It's rendered in the background, behind everything, and  available for look-up from shader code. This allows development of visual effects such as reflection.

To setup an Environment, select a Scene and edit its properties in the :ref:`Properties View <properties-view>`.

Environment Types
=================

Color
-----

	.. image:: ./images/environment-color.jpg

Sky Simulation
--------------

Based on `@blurspline <https://twitter.com/blurspline>`_'s implementation of `A Practical Analytic Model for Daylight <https://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf>`_

	.. image:: ./images/environment-sky-sim.jpg

.. _sky-box:

Sky Box
-------

Uses a Sky Box geometry, mapped with a :ref:`CubeMap <cubemap>` texture.

	.. image:: ./images/environment-skybox.jpg

Fog
===

Linear
------

    .. image:: ./images/fog-linear.jpg

Exponential
-----------

.. image:: ./images/fog-exponential.jpg
