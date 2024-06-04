module.exports = class LoxError extends Error {
    static hadError = false;

    constructor(token, message) {
        super(`${token.line}: '${token.lexeme}' ${message}`)
        this.name = 'LoxError: '
      }

    // set error variable
    static setError(boolValue) {
        this.hadError = boolValue;
    }

    // reports and executes an error
    static report(line, where = "", message = "") {
        console.log('\x1b[34m%s\x1b[0m', "[line " + line + "] Error" + where + ": " + message);
        this.setError(true);
    }
}