module.exports = class Token {
    static type; // enum
    static lexemme; //string
    static literal; // object
    static line; // number

    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexemme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString() {
        return this.type + " " + this.lexemme + " " + this.literal;
    }
}