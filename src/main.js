// #!/usr/bin/env node

const Lox = require('./Lox');

console.log({ "Loxssss": Lox });


function main () {
    const run = Lox.init;

    run()
}

main()