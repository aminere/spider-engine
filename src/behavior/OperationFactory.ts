/**
 * @hidden
 */
// This is not used and is here for reference only!
// tslint:disable:no-any
class OperationFactory {

    static binaryOperations: {
        [op: string]: (left: any, right: any) => boolean | number;
    } = {
        "<": (a, b) => a < b,
        ">": (a, b) => a > b,
        ">=": (a, b) => a >= b,
        "<=": (a, b) => a <= b,
        // tslint:disable-next-line
        "==": (a, b) => a == b,
        "===": (a, b) => a === b,
        "!==": (a, b) => a !== b,
         // tslint:disable-next-line
        "!=": (a, b) => a != b,
        "*": (a, b) => a * b,
        "/": (a, b) => a / b,
        "+": (a, b) => a + b,
        "-": (a, b) => a - b,
        "=": (a, b) => b,
        "%": (a, b) => a % b
    };

    static unaryOperations: {
        [op: string]: (arg: any) => any;
    } = {
        "-": arg => -arg,
        "!": arg => !arg
    };

    static logicalOperations: {
        [op: string]: (left: any, right: any) => boolean;
    } = {
        "&&": (a, b) => a && b,
        "||": (a, b) => a || b
    };

    static assignmentToBinaryOperator = {
        "+=": "+",
        "-=": "-",
        "*=": "*",
        "/=": "/",
        "=": "="
    };

    static doBinaryOperation(op: string, left: any, right: any) {
        let doIt = OperationFactory.binaryOperations[op];
        if (doIt) {
            return doIt(left, right);
        }        
        return undefined;
    }

    static doUnaryOperation(op: string, arg: any) {
        let doIt = OperationFactory.unaryOperations[op];
        if (doIt) {
            return doIt(arg);
        }        
        return undefined;        
    }

    static doLogicalOperation(op: string, left: any, right: any) {
        let doIt = OperationFactory.logicalOperations[op];
        if (doIt) {
            return doIt(left, right);
        }        
        return undefined;        
    }

    static doAssignmentOperation(op: string, left: any, right: any) {
        let binaryOperator = OperationFactory.assignmentToBinaryOperator[op];
        if (binaryOperator) {
            return OperationFactory.doBinaryOperation(binaryOperator, left, right);
        }
        return undefined;
    }
}

export { OperationFactory };
