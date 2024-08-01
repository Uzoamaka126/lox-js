const fs = require('fs');
const path = require('path');

// Houses a generated Visitor class and a set of expression node classes that support the Visitor pattern using it.

class GenerateAst {
    static main(args) {
        console.log(args.length, { args });

        if (args.length != 1) {
            console.error("Usage: generate_ast <output directory>");
            process.exit(64);
        }
        
        this.#defineAst("Expr", Array.from([
            "Binary   : Expr left, Token operator, Expr right",
            "Grouping : Expr expression",
            "Literal  : Object value",
            "Unary    : Token operator, Expr right"
        ]));
    }

    static #defineAst(baseName, types) {
        // const filePath = path.join(outputDir, `/${baseName}.js`);
        const filePath = path.join(__dirname, `/${baseName}.js`);

        const writer = fs.createWriteStream(filePath, { encoding: 'utf8' });

        // writer.write('package com.craftinginterpreters.lox \n'); // writer.println("package com.craftinginterpreters.lox;");
        // writer.write('\n');
        // writer.write('Import statement here\n'); // writer.println("import java.util.List;");
        // writer.write('\n');
        writer.write(`class ${baseName} {\n  accept(visitor) {} \n}`);

        // The base accept() method.
        writer.write('\n');

        this.#defineVisitor(writer, baseName, types);

        writer.write('\n');

       // The AST classes: Iterate over each type and define types
        types.forEach((type) => {
            const splitStr = type.split(':');

            const className = splitStr[0].trim();
            const fields = splitStr[1].trim().replaceAll(/\b(Expr|Object|Token)\b/g, "").trim();

            this.#defineType(writer, baseName, className, fields);
        });

        // export the Expr class before ending write stream
        writer.write(`module.exports = {`);

        writer.write(` ${baseName}, Visitor, Unary, Binary, Grouping, Literal }`);

        writer.end();
    }

    static #defineType(writer, baseName, className, fieldList) {        
        writer.write(`class ${className} extends ${baseName} {`);
        writer.write('\n');

        // Constructor.
        writer.write(`  constructor(${fieldList}) {`);
        writer.write('\n');
        writer.write(`    super();`);
        writer.write('\n');

        // Store parameters in fields.
        const fields = fieldList.split(", ");

        fields.forEach((field) => {
            const name = field.trim();

            writer.write(`    this.${name} = ${name};`);
            writer.write('\n');
        });

        writer.write("  }");

        // Visitor pattern.
        writer.write("\n");
        writer.write("  accept(visitor) {");
        writer.write("\n");
        writer.write("    return visitor.visit" + className + baseName + "(this);");
        writer.write("\n");
        writer.write("  }");
        writer.write("\n");

        writer.write("}");
        writer.write("\n");
        writer.write("\n");
    }

    static #defineVisitor(writer, baseName, types) {
        writer.write('\n');
        writer.write(`class Visitor {`);

        writer.write('\n');
        writer.write(`  print(${baseName.toLowerCase()}) {`);
        writer.write('\n');
        writer.write(`    return ${baseName.toLowerCase()}.accept(this)`);
        writer.write('\n');
        writer.write('  }');

        // Store parameters in fields.
        types.forEach((type) => {
            const typeName = type.split(":")[0].trim();

            writer.write("\n");
            writer.write(`  visit${typeName}${baseName}(${baseName.toLowerCase()}) {}`);
        });

        writer.write("\n");
        writer.write("}");
        writer.write('\n');
    }
};

const args = process.argv.slice(2);

GenerateAst.main(args);

// module.exports = GenerateAst;