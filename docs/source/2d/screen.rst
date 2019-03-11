
.. _screen:

======
Screen
======

A Screen is a hierarchy of 2D elements in your Scene.

You can have multiple Screens in the same scene.

To create a Screen, click on the Insert Button |insert_button| in the `Editor <https://spiderengine.io/editor>`_ and select **Screen**.

.. |insert_button| image:: ../images/insert_button.png

Screen Properties
=================

Resolution
----------

By default, 2D elements keep a fixed size on the Screen (based on their original size).

This is not ideal when running on platforms that have different resolutions, such as mobile.

The Resolution property determines how elements adapt to different resolutions, while preserving the screen's aspect ratio.

* **Resolution Size**: Determine the Reference Resolution and Aspect Ratio that will be dynamically matched. This should typically be set to the resolution of your background art assets.

* **Adaptive Width**: The screen's Height will match the real device height, but the Width will be adjusted depending on the Aspect Ratio of the Reference Resolution:

	.. image:: ./images/resolution_adaptive_width.jpg

* **Adaptive Height**: The screen's Width will match the real device width, but the Height will be adjusted depending on the Aspect Ratio of the Reference Resolution:

	.. image:: ./images/resolution_adaptive_height.jpg

.. note::

    To avoid black bars on the edges of the screen in certain resolutions, simply make your backgrounds in the highest aspect ratio you are willing to support (For example 16:9 on iOS).

    This will guarantee your backgrounds to show in fullscreen in 16:9, and be cropped in lower aspect ratios, but no black bars will be ever seen.
