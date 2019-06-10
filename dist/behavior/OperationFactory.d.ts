/**
 * @hidden
 */
declare class OperationFactory {
    static binaryOperations: {
        [op: string]: (left: any, right: any) => boolean | number;
    };
    static unaryOperations: {
        [op: string]: (arg: any) => any;
    };
    static logicalOperations: {
        [op: string]: (left: any, right: any) => boolean;
    };
    static assignmentToBinaryOperator: {
        "+=": string;
        "-=": string;
        "*=": string;
        "/=": string;
        "=": string;
    };
    static doBinaryOperation(op: string, left: any, right: any): number | boolean | undefined;
    static doUnaryOperation(op: string, arg: any): any;
    static doLogicalOperation(op: string, left: any, right: any): boolean | undefined;
    static doAssignmentOperation(op: string, left: any, right: any): number | boolean | undefined;
}
export { OperationFactory };
