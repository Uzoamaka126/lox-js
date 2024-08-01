const Token = require("./Token");
const { Binary, Unary, Literal, Grouping } = require("../tool/Expr");
const TokenType = require("./TokenType");

class AstPrinter {
    print(expr) {
        return expr.accept(this);
    }

    visitBinaryExpr(expr) {
        return this.parenthesize(expr.operator.lexemme, expr.left, expr.right);
    }

    visitGroupingExpr(expr) {
        return this.parenthesize("group", expr.expression);
    }

    visitLiteralExpr(expr) {
        if (expr.value === null) return "nil";

        return expr.value.toString();
    }

    visitUnaryExpr(expr) {
        return this.parenthesize(expr.operator.lexemme, expr.right);
    }

    parenthesize(name, ...exprs) {
        let result = `(${name}`;

        for (const expr of exprs) {
            result += ` ${expr.accept(this)}`;
        }
        
        result += `)`;
        
        return result;
    }

    static main(args) {
        const expression = new Binary(
            new Unary(
                new Token(TokenType.MINUS, '-', null, 1),
                new Literal(123)
            ),
            new Token(TokenType.STAR, '*', null, 1),
            new Grouping(
                new Literal(45.67)
            )
        );

        console.log(new AstPrinter().print(expression));
    }
}

AstPrinter.main();