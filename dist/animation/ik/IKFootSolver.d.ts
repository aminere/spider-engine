import { IKSolverBase } from "./IKSolverBase";
/**
 * Solves IK for two bones
 * - Works in 2D. Solves joint angles using cosine rule
 * - Then rotates root bone towards the target
 */
export declare class IKFootSolver extends IKSolverBase {
    update(): void;
}
