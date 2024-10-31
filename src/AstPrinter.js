// Base Expression class
class Expr {
    accept(visitor) {
        throw new Error("accept() not implemented");
    }
}

class Binary extends Expr {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}

class Literal extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }

    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}

class Grouping extends Expr {
    constructor(expression) {
        super();
        this.expression = expression;
    }

    accept(visitor) {
        return visitor.visitGroupingExpr(this);
    }
}

class Unary extends Expr {
    constructor(operator, right) {
        super();
        this.operator = operator;
        this.right = right;
    }

    accept(visitor) {
        return visitor.visitUnaryExpr(this);
    }
}

class AstPrinter {
    print(expr) {
        return expr.accept(this);
    }

    visitBinaryExpr(expr) {
        return this.parenthesize(expr.operator, expr.left, expr.right);
    }

    visitLiteralExpr(expr) {
        if (expr.value === null) return "null";
        return expr.value.toString();
    }

    visitGroupingExpr(expr) {
        return this.parenthesize("group", expr.expression);
    }

    visitUnaryExpr(expr) {
        return this.parenthesize(expr.operator, expr.right);
    }

    parenthesize(name, ...exprs) {
        let output = `(${name}`;

        for (let expr of exprs) {
            output += " ";
            output += expr.accept(this);
        }

        output += ")";
        return output;
    }
}

const ast = new AstPrinter();

// const result = -(123) * 45.67;
// const expression = new Binary(
//     new Unary("-", new Literal(123)),
//     "*",
//     new Grouping(new Literal(45.67))
// );


// const expression = new Binary(
//     new Binary(new Literal(6), '/', new Literal(3)),
//     "-",
//     new Binary(new Literal(1), '*', new Literal(4))
// );

// console.log({ expression });

// console.log(ast.print(expression));  // Prints: (* (- 123) 45.67)

module.exports = {
    AstPrinter, Binary, Expr, Literal, Unary, Grouping
};