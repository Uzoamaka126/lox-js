const TOKEN_TYPE = require('./TokenType');
const Token = require('./Token');
const LoxError = require('./Error');

class Scanner {
    #SOURCE = ""; // raw source code as a string
    #IDENTIFIER = "";
    #TOKENS = []; // a default empty list to add generated tokens to
    #start = 0; // points to the first character in the lexeme being scannedd
    #current = 0; // points to the character being currently considered
    #line = 1; // tracks what source line "current" is on 

    constructor(source = "") {
        this.#SOURCE = source;
    }

    scanTokens() {
        while(!this.isAtEnd()) {
            // at the beginning of the next lexeme
            this.#start = this.#current;
            this.#scanToken();
        }

        // otherwise append a final "end of file" token to make parser cleaner
        this.#TOKENS.push(new Token(TOKEN_TYPE.EOF, "", null, this.#line));
        return this.#TOKENS;
    }

    isAtEnd() {
        return this.#current >= this.#SOURCE.length;
    }

    #scanToken() {
        const c = this.#advance();

        switch (c) {
            // single character
            case "(": this.#addToken(TOKEN_TYPE.LEFT_PAREN); break;
            case ")": this.#addToken(TOKEN_TYPE.RIGHT_PAREN); break;
            case "{": this.#addToken(TOKEN_TYPE.LEFT_BRACE); break;
            case "}": this.#addToken(TOKEN_TYPE.RIGHT_BRACE); break;
            case ",": this.#addToken(TOKEN_TYPE.COMMA); break;
            case ".": this.#addToken(TOKEN_TYPE.DOT); break;
            case "-": this.#addToken(TOKEN_TYPE.MINUS); break;
            case "+": this.#addToken(TOKEN_TYPE.PLUS); break;
            case ";": this.#addToken(TOKEN_TYPE.SEMICOLON); break;
            case "*": this.#addToken(TOKEN_TYPE.STAR); break;

            // second character
            case "!": this.#addToken(this.#match("=") ? TOKEN_TYPE.BANG_EQUAL : TOKEN_TYPE.BANG); break;
            case "=": this.#addToken(this.#match("=") ? TOKEN_TYPE.EQUAL_EQUAL : TOKEN_TYPE.EQUAL); break;
            case "<": this.#addToken(this.#match("=") ? TOKEN_TYPE.LESS_EQUAL : TOKEN_TYPE.LESS); break;
            case ">": this.#addToken(this.#match("=") ? TOKEN_TYPE.GREATER_EQUAL : TOKEN_TYPE.GREATER); break;

            case "/": 
                if (this.#match("/")) {
                    // a comment goes until the end of the line
                    while (this.#peek() != '\n' && !this.isAtEnd()) this.#advance();
                } else {
                    this.#addToken(TOKEN_TYPE.SLASH);
                }
                break;

            case " ": 
            case "\r": 
            case "\t": 
            // ignore whitespace
                break;
            
            case "\n": 
                this.#line++;
                break;
            
            case '""': 
                this.#string();
                    break;

            // if any characters are passed that unrecognizable to Lox, report an error
            default:
                if (this.#isDigit(c)) {
                    this.#number();
                } else if (this.#isAlpha(c)) {
                    this.#identifier();
                } else {
                    LoxError.report(this.#line, "", "Unexpected character.")
                }
                break;
        }
    }

    // consumes the next character in the source file and returns it: for input
    #advance() {
        this.#current++;
        return this.#SOURCE.charAt(this.#current - 1);
    }

    // output: grabs the text of the current lexeme and creates a new token for it
    #addToken(type, literal = null) { // type: TOKEN_TYPE, literal: Object
        const text = this.#SOURCE.substring(this.#start, this.#current);

        this.#TOKENS.push(new Token(type, text, literal, this.#line));
    }

    #match(expected = "") { // type character/string
        if (this.isAtEnd()) return false;
        
        if (this.#SOURCE.charAt(this.#current) != expected) return false;

        this.#current++;
        return true;
    }

    #peek() {
        if (this.isAtEnd()) return "\0";
        return this.#SOURCE.charAt(this.#current)
    }

    #peekNext() {
        if (this.#current + 1 >= this.#SOURCE.length()) return '\0';
        return this.#SOURCE.charAt(current + 1);
    } 

    #string() {
        while (this.#peek() != '"' && !this.isAtEnd()) {
            if (this.#peek() === '\n') this.#line++;
            this.#advance();
        }

        if (this.isAtEnd()) {
            LoxError.report(this.#line, "", "Unterminated string.");
            return;
        }

        // The closing ".
        this.#advance();

        // Trim the surronding quotes
        const value = this.#SOURCE.substring(this.#start + 1, this.#current - 1);
        this.#addToken(TOKEN_TYPE.STRING, value);
    }

    #number() {
        while(this.#isDigit(this.#peek())) {
            this.#advance();
        }

        // look for a fractional part
        if (this.#peek() == '.' && this.#isDigit(this.#peekNext())) {
            // consume the "."
            this.#advance();

            while (this.#isDigit(this.#peek())) {
                this.#advance()
            }
        }
        const parsedNum = parseFloat(this.#SOURCE.substring(this.#start, this.#current))

        this.#addToken(TOKEN_TYPE.NUMBER, parsedNum);
    }

    #isDigit(c) {
        return c >= '0' && c <= '9';
    }

    #peekNext() {
        if (this.#current + 1 > this.#SOURCE.length) return '\0';
        return this.#SOURCE.charAt(this.#current + 1);
    }

    #identifier() {
        while (this.#isAlphanumeric(this.#peek)) {
            this.#advance();

            const text = this.#SOURCE.substring(this.#start, this.#current);
            let type = this.#keywords().get(text);

            if (type === null) {
                type = this.#IDENTIFIER;
            }

            this.#addToken(type);
        }
    }

    #isAlpha(char) {
        return (char >= 'a' && char <= 'z') || 
            (char >= 'A' && char <= 'Z') || 
            char === '_';
    }

    #isAlphanumeric(char) {
        return this.#isAlpha(char) || this.#isDigit(char);
    }

    // define the set of reserved keywords using a Map
    #keywords() {
        const keys = new Map();

        keys.set("and", TOKEN_TYPE.AND);
        keys.set("class", TOKEN_TYPE.CLASS);
        keys.set("else", TOKEN_TYPE.ELSE);
        keys.set("false", TOKEN_TYPE.FALSE);
        keys.set("for", TOKEN_TYPE.FOR);
        keys.set("fun", TOKEN_TYPE.FUN);
        keys.set("if", TOKEN_TYPE.IF);
        keys.set("nil", TOKEN_TYPE.NIL);
        keys.set("or", TOKEN_TYPE.OR);
        keys.set("print", TOKEN_TYPE.PRINT);
        keys.set("return", TOKEN_TYPE.RETURN);
        keys.set("super", TOKEN_TYPE.SUPER);
        keys.set("this", TOKEN_TYPE.THIS);
        keys.set("true", TOKEN_TYPE.TRUE);
        keys.set("var", TOKEN_TYPE.VAR);
        keys.set("while", TOKEN_TYPE.WHILE);

        return keys;
    }  

    // check operands
    // params: operator - Type Token, operand - Type Object
    #checkNumberOperand(operator, operand) {
        if (operand instanceof Number) return;
        throw new LoxError(operator, "Operand must be a number.")
    }
}

export default Scanner;