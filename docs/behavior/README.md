# Behavior
Spider provides a visual programming environment, through assets called a **Behaviors**.

Behaviors are graphs that represent an execution flow. They have access to the engine through an [API](api.md) and can perform a wide range of functionality.
> Similarily to a traditional program, a behavior has a single starting point and an optional single exit point.

<img src="/docs/behavior/fish_behavior.jpg">
<center>Fish Flock Behavior</center>

## Parts of a Behavior
### Inputs
<img src="/docs/behavior/inputs.jpg">  
- A Behavior can have any number and any combination of inputs.
- The inputs are exposed on the Behavior Components for user editing. 
- They are accessible to all the nodes within the Behavior.

### Outputs
<img src="/docs/behavior/outputs.jpg">
### Nodes
There are several types of nodes that can be used to make a behavior.
- Operators

    - **Built-in Operators**  
    These are standard nodes that are part of the engine and are accessible to all applications made with Spider.
    - **Code Blocks**  
    Code blocks are the main way to implement your custom functionality.

<!-- - Converters -->

## Behavior Component
The Behavior Component lets you attach a behavior to an Entity.
The Behavior executes as long as the Entity is Active and present in the scene.

> Work in Progress
<center><img src="/docs/wip.svg" width="250px"></center>

<!-- ## Pin Types
* **Signal Pins**: transmit execution signals across the behavior graph.
* **Data Pins**: transmit data across the behavior graph.

## Node Types

### Converters
Converters are dedicated to data transformation and have no signal pins.

### Operators
Operators have at least a **Start** and **Finish** signal pins. In addition, the

### Code Blocks
Code blocks are the main way to implement your functionality.

### Nested Behaviors

## Data Types
### Object Declarations

## Debugging your Code*/
-->
