# Extending Visual Studio Code

## Intro

[Visual Studio Code](https://code.visualstudio.com) is a lightweight, yet powerful text editor that runs on Windows, Mac, and Linux. 

VS Code supports custom colorization, snippets, commands, and more through a flexible extension API. 

In this talk you'll learn some basics about writing extensions for VS Code, how to publish those extensions into the [Visual Studio Marketplace](https://marketplace.visualstudio.com/VSCode), and get some resources and guidance on considerations for extension development. 

## Getting Started 

### Prerequisites

1. [Visual Studio Code](https://code.visualstudio.com)
1. [Node.js](https://nodejs.org/en/https://nodejs.org/) - VS Code depends on Node.js
1. [Yeoman](http://yeoman.io/) - The template engine used by the scaffolder
1. [Yeoman VS Code Generator](https://www.npmjs.com/package/generator-code) - scaffolds extension project structure
1. [Visual Studio Code Extension Manager](https://www.npmjs.com/package/vsce) (VSCE) - for publishing to the marketplace

## Demo Setup

This talk is about extension development, so the target audience for the talk is extension developers. 

The demo story will demonstrate how to build an extension to make it easy for other extension authors. In fact, the talk will be done using an extension built in order to streamline the demonstrations in the talk. 

> **Action Item**: Create a new extension using the Yeoman scaffolder named **target-extension** before continuing with the demos. Open it up whenever debugging the extension as it is built throughout the demos.

---

### Demo 1 - Create a logging snippet

When you're developing extensions you need to see what's happening in your development instance of VS Code. Let's make a snippet that makes it easy to insert the `console.log` call, since we'll use it a lot during extension debugging. 

1. Create a new empty JS extension named `meta-extension`
1. Open the `meta-extension` folder in VS Code
1. Add the file `snippets/console.json` to the workspace with this JSON

    ```json
    {
        "Print to console": {
            "prefix": "log",
            "body": [
                "console.log('$1');"
            ],
            "description": "Log output to the VS Code console window."
        }
    }
    ```

1. Add this JSON to the `contributes` section of the `package.json` file to load the snippet when the extension is loaded

    ```json
    "contributes": {
        "snippets": [
            {
                "language": "javascript",
                "path": "./snippets/console.json"
            }
        ]
    }
    ```

1. Debug the extension
1. Open the **target-extension** target project in the debugging instance
1. Use the two snippets to extend the **target-extension** project
1. Debug the **target-extension** to show the message appearing in the development instance

--- 

### Demo 2 - Commands

The command palette gives customers a convenient way to execute commands contributed by extensions. 

1. Note the `contributes` section and how there is a single command named `sayHello`

    ```json
    "commands": [
            {
                "command": "extension.sayHello",
                "title": "Hello World"
            }
        ],
    ```

1. Note the handler for the `sayHello` command in `extension.js`

    ```javascript
    var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });
    ```

1. Put a breakpoint on the handler and run the extension
1. Use `Ctrl-Shift-P` or `Cmd-Shift-P` to open the command palette
1. Type **Hello World** to see the command in the palette
1. Select it and note execution stops on the breakpoint

---

### Demo 3 - Add a new command 

Commands are useful for componentizing and isolating parts of the functionality your extension offers so that it can be called via the **Command Palette** or when users perform certain actions, like clicking on a button in the VS Code toolbar. 

1. Note the `activationEvents` section in `package.json`

    ```json
    "activationEvents": [
        "onCommand:extension.sayHello"
    ]
    ```

1. With this setting the extension won't activate **until** the `sayHello` command is called, so it needs to be changed so that the extension activates right away. Optionally, we could just add the various commands that could activate the extension. 

    ```json
    "activationEvents": [
        "*"
    ],
    ```

1. Add a new command named `meta.slowProcess` to the `package.json` file

    ```json
    {
        "command": "meta.slowProcess",
        "title": "Run Slow Process"
    }
    ```

1. Create a new directory named `commands` in the project and add a file to it named `slowProcess.js`

    > Rather than register all the command handlers manually in the `extension.js` file, the command handler logic can be separated into multiple files. 

    Then add the following code to the file to export a method to wire up the command handler to the VS Code context. 

    ```javascript
    var vscode = require('vscode');

    module.exports = exports = function (context) {
        var disposable = vscode.commands.registerCommand('meta.slowProcess', function () {
            vscode.window.showInformationMessage('Starting the slow process...');
        });

        context.subscriptions.push(disposable);
    }
    ```

1. In the `extension.js` file, wire up the command handler after the `sayHello` command has been registered. 

    ```javascript
    // wire up the other commands
    slowProcess(context);
    ```

1. Debug the extension and use `Ctrl-Shift-P` or `Cmd-Shift-P` to run command titled `Run Slow Process`

---

### Demo 4 - Use the output window to give the customer information

Customers who use your extensions need to know what's happening so they typically look at the output window. 

1. Replace the code in the `commands/slowProcess.js` file with this code

    ```javascript
    var vscode = require('vscode');

    const outputChannelName = 'META';

    module.exports = exports = function (context) {
        var disposable = vscode.commands.registerCommand('meta.slowProcess', function () {
            var outputChannel = vscode.window.createOutputChannel(outputChannelName);
            outputChannel.show(false);
            outputChannel.appendLine('Starting the slow process...');

            setTimeout(() => {
                outputChannel.appendLine('Process complete');
            }, 3000);
        });

        context.subscriptions.push(disposable);
    }
    ```

1. Debug the extension and run the `slowProcess` command a few times. Once with the output window entirely closed, once with a different channel selected. Note how the `outputChannel.show()` method could be used to make for a less-intrusive experience when providing the user feedback. 

--- 
