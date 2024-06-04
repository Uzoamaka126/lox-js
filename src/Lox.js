#!/usr/bin/env node

// we need the following packages
/* 
    buffer reader
    io exception
    input stream reader
    char set manager(?)
    files package
    file path reader
    util list (i think node has an equivalent of this)
*/
const process = require('node:process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Scanner = require('./Scanner');
const LoxError = require('./Error');

// initiate a public class
class Lox {
    _baseDir = path.join(__dirname, '/');

    constructor() {}

    static init(...args) {
        if (args.length > 1) {
            console.log("Usage: jlox [script]");
            process.exit(0);
        } else if (args.length === 1) {
            this.#runFile(args[0]);
        } else {
            console.log({ 'this': this });
            this.#runPrompt();
        }
    }

    // reads a file and executes it: opens a binary file, reads the contents of the file into a byte array, and then closes the file.
    static #runFile(filePath) {
        let bytes = [] // a byte array that holds read file contents

        // callback function to run after the file read is successfully resolved or rejected
        const callback = (err, strResult) => {
            if (!err && strResult) {
                console.log('File was successfully read', { strResult });
                // transform byte array back to string by parsing
                this.#run(result);

                // indicate an error in the exit code
                if (LoxError.hadError) {
                    process.exit(1);
                }
            } else {
                console.log(`An error occurred`);
            }
        }

        // read file content
        fs.readFile(this.baseDir+filePath, 'utf8', function(err, data){
            if (!err && data){
                // Convert data buffer to byte array
                // bytes = Array.from(data);

                // Convert data buffer to byte array
                const convertedStr = data.toString('utf8');
              callback(err, convertedStr); // send back the converted string
            } else {
              callback(err, data);
            }
        });
    }

    // executes an interactive prompt
    static #runPrompt() {
        // setup an input stream reader
        console.log('\x1b[35m%s\x1b[0m', "Listening in for user input:");

        // start the interface
        const _interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> '
        })

        // manually create an initial prompt
        _interface.prompt();

        // handle each line of input separately
        _interface.on('line', (input) => {
            // do something with the input
            const line = input;

            this.#run(line);

            // reset the error flag to avoid closing the prompt listener if an error occurs
            LoxError.setError(false);

            // reinitialize the prompt afterwards
            _interface.prompt();
        })

        // if the user stops the CLI, kill the associated process
        _interface.on('close', function() {
            console.log('Exiting the command line...');
            process.exit(0);
        });
    }

    // run 
    static #run(source) {
        const scanner = new Scanner(source);
        const tokens = scanner.scanTokens(); // List

        for (let i = 0; i < tokens.length; i++) {
            console.log(tokens[i]);
        }
    }
}

Lox.init();

module.exports = Lox;