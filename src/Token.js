module.exports = class Token {
    TYPE;
    LEXEMME;
    LITERAL;
    LINE;

    constructor(type, lexeme, literal, line) {
        this.TYPE = type;
        this.LEXEMME = lexeme;
        this.LITERAL = literal;
        this.LINE = line;
    }

    toString() {
        return this.TYPE + " " + this.LEXEMME + " " + this.LITERAL;
    }
}