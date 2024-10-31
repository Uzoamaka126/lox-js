const TOKEN_TYPE = require('./TokenType');
const LoxError = require('./Error');
const { Binary, Unary, Literal, Grouping } = require('./AstPrinter');

class Parser {
    current = 0;
    tokens = [];

    constructor(tokens = []) {
        if (!Array.isArray(tokens)) {
            throw new TypeError('Tokens must be an array');
        }
        this.tokens = tokens;
    }

    parse() {
        try {
           return this.expression() 
        } catch (error) {
            console.log({ parseErr: error });
            return null
        }
    }

    expression() {
        return this.equality()
    }

    equality() {        
        let expr = this.comparison();

        while (this.match(TOKEN_TYPE.BANG_EQUAL, TOKEN_TYPE.EQUAL_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();

            expr = new Binary(expr, operator.lexemme, right);
        }

        return expr;
    }

    comparison() {
        let expr = this.term();

        while (this.match(TOKEN_TYPE.GREATER, TOKEN_TYPE.GREATER_EQUAL, TOKEN_TYPE.LESS, TOKEN_TYPE.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            expr = new Binary(expr, operator.lexemme, right)
        }

        return expr;
    }

    term() {
        let expr = this.factor();

        while(this.match(TOKEN_TYPE.MINUS, TOKEN_TYPE.PLUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new Binary(expr, operator.lexemme, right)
        }

        return expr;
    }

    factor() {
        let expr = this.unary();

        while(this.match(TOKEN_TYPE.SLASH, TOKEN_TYPE.STAR)) {
            const operator = this.previous();
            const right = this.unary();

            expr = new Binary(expr, operator.lexemme, right)
        }

        return expr;
    }

    unary() {
        if (this.match(TOKEN_TYPE.BANG, TOKEN_TYPE.MINUS)) {
            console.log('this.match(TOKEN_TYPE.BANG, TOKEN_TYPE.MINUS');
            const operator = this.previous();
            const right = this.unary();

            return new Unary(operator.lexemme, right)
        }

        return this.primary();
    }

    primary() {
        if (this.match(TOKEN_TYPE.FALSE)) return new Literal(false);
        if (this.match(TOKEN_TYPE.TRUE)) return new Literal(true);
        if (this.match(TOKEN_TYPE.NIL)) return new Literal(null);

        if (this.match(TOKEN_TYPE.NUMBER, TOKEN_TYPE.STRING)) {
            return new Literal(this.previous().literal);
        }

        if (this.match(TOKEN_TYPE.LEFT_PAREN)) {
            const expr = this.expression();
            this.consume(TOKEN_TYPE.RIGHT_PAREN, "Expect ')' after expression");

            return new Grouping(expr);
        }

        throw this.error(this.peek(), "Expected expression")
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();

        throw this.error(this.peek(), message)
    }

    error(token, message) {
        // LoxError.error(token, message);

        if (token.type === TOKEN_TYPE.EOF) {
            throw new SyntaxError(`Invalid or unexpected token, at end, ${message}`);
        } else {
            throw new SyntaxError(`Invalid or unexpected token ${token.lexemme}, at line ${token.line}, ${message}`);
        }
    }

    synchronize() {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type === TOKEN_TYPE.SEMICOLON) return;

            switch (this.peek().type) {
                case TOKEN_TYPE.CLASS:
                case TOKEN_TYPE.FUN:
                case TOKEN_TYPE.VAR:
                case TOKEN_TYPE.FOR:
                case TOKEN_TYPE.IF:
                case TOKEN_TYPE.WHILE:
                case TOKEN_TYPE.PRINT:
                case TOKEN_TYPE.RETURN:
                    return;
                default:
                    // this.advance();
            }

            this.advance();
        }
    }

    match(...tokenTypes) {        
        for (let type of tokenTypes) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    check(tokenType) {
        if (this.isAtEnd()) return false;
        return this.peek().type === tokenType;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.peek().type === TOKEN_TYPE.EOF;
    }

    peek() {
        return this.tokens[this.current]
    }

    previous() {
        return this.tokens[this.current - 1]
    }
}

module.exports = Parser;