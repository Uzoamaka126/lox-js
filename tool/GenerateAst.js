const fs = require('fs');
const path = require('path');

class GenerateAst {
    static main(args) {
        console.log(args.length, { args });
        // if (args.length != 1) {
        //     console.error("Usage: generate_ast <output directory>");
        //     process.exit(64);
        // }

        const outputDir = args[0];

        console.log({ outputDir });
        
        this.#defineAst(outputDir, "Expr", Array.from([
            "Binary   : Expr left, Token operator, Expr right",
            "Grouping : Expr expression",
            "Literal  : Object value",
            "Unary    : Token operator, Expr right"
        ]));
    }

    static #defineAst(outputDir, baseName, types = []) {
        // const filePath = path.join(outputDir, `/${baseName}.js`);
        const filePath = path.join(__dirname, `/${baseName}.js`);

        console.log({ filePath });

    //     const writer = fs.createWriteStream(filePath, { encoding: 'utf8' });

    //     writer.write('package com.craftinginterpreters.lox \n');
    //     writer.write('\n');
    //     writer.write('Import statement here\n');
    //     writer.write('\n');
    //     writer.write(`abstract class ${baseName} {\n`);

    //     this.#defineVisitor(writer, baseName, types);

    //    // The AST classes: Iterate over each type and define types
    //     types.forEach((type) => {
    //         const className = type.split(':')[0].trim();
    //         const fields = type.split(':')[1].trim();

    //         this.#defineType(writer, baseName, className, fields);
    //     });

    //     // The base accept() method.
    //     writer.write('\n');
    //     writer.write("  abstract <R> R accept(Visitor<R> visitor);");
      
    //     writer.write('}\n');
    //     writer.end();
    }

    static #defineType(writer, baseName, className, fieldList) {
        writer.write(`  static class  ${className} extends ${baseName} {`);

        // Constructor.
        writer.write(`  ${className} ( extends ${fieldList} ) {`);

        // Store parameters in fields.
        const fields = fieldList.split(", ");
        fields.forEach((field) => {
            const name = field.split(" ")[1];

            writer.write(`      this. ${name} = ${name};`);
        });

        writer.write("    }");

        // Visitor pattern.
        writer.write();
        writer.write("    @Override");
        writer.write("    <R> R accept(Visitor<R> visitor) {");
        writer.write("      return visitor.visit" +
            className + baseName + "(this);");
        writer.write("    }");

        // Fields.
        writer.write("\n");
        fields.forEach((field) => {
            writer.write(`    final ${field};`);
        });

        writer.println("  }");
    }

    static #defineVisitor(writer, baseName, types) {
        writer.write(`"  interface Visitor<R> {`);

        // Store parameters in fields.
        types.forEach((type) => {
            const typeName = type.split(":")[0].trim();

            writer.write(`    R visit" ${typeName} ${baseName} (${typeName} ${baseName.toLowerCase()});`);
        });

        writer.write("  }");
    }
};

const args = process.argv.slice(2);

GenerateAst.main(args);

// module.exports = GenerateAst;