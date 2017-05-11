# Extending Visual Studio Code

## Intro

[Visual Studio Code](https://code.visualstudio.com) is a lightweight, yet powerful text editor that runs on Windows, Mac, and Linux. 

VS Code supports custom colorization, snippets, commands, and more through a flexible extension API. 

In this talk you'll learn some basics about writing extensions for VS Code, how to publish those extensions into the [Visual Studio Marketplace](https://marketplace.visualstudio.com/VSCode), and get some resources and guidance on considerations for extension development. 

## Session Goals and Setup

The target audience for the talk is VS Code users at an intermediate level with experience in TypeScript or JavaScript. There is an accompanying PowerPoint presentation in the session's repository

**No previous VS Code or Visual Studio extension development is required**. By all meausre this is a **general 200-level** session, or a **100-level session** for those who have extended IDEs in the past. You wouldn't want to attend if you've already developed an arsenal of VS Code extension development experience, but if you're new to it you're in the right spot. 

The demo story will be the creation of a simple extension that performs some simple tricks, but that encorporates numerous facets of VS Code extension development in a continuous experience. 

### Prerequisites

1. [Visual Studio Code](https://code.visualstudio.com)
2. [Node.js](https://nodejs.org/en/https://nodejs.org/) - VS Code depends on Node.js
3. [Yeoman](http://yeoman.io/) - The template engine used by the scaffolder
4. [Yeoman VS Code Generator](https://www.npmjs.com/package/generator-code) - scaffolds extension project structure
5. [Visual Studio Code Extension Manager](https://www.npmjs.com/package/vsce) (VSCE) - for publishing to the marketplace

### Session Setup

1. Set up an account in the Marketplace. 
2. Create a bookmark to your Marketplace account at  [https://marketplace.visualstudio.com/manage/publishers/{your-publisher}](https://marketplace.visualstudio.com/manage/publishers/{your-publisher})
3. Create a new extension using the Yeoman scaffolder named **target-workspace** before continuing with the demos. Open it up whenever debugging the extension as it is built throughout the demos.
4. Clone this repository.

(Optional setup if you truly want a fresh start)

5. Create a local branch to practice in, but keeping the master branch in case you bone something up.
    ```
    git branch practice01
    git checkout practice01
    ```
6. Delete the `demo-extension-workspace` and `target-workspace`

---

## Snippets

### Demo 1 - Create a logging snippet

When you're developing extensions you need to see what's happening in your development instance of VS Code. Let's make a snippet that makes it easy to insert the `console.log` call, since we'll use it a lot during extension debugging. 

1. Create a new empty JS extension named `demo-extension-workspace`
2. Open the `demo-extension-workspace` folder in VS Code
3. Add the file `snippets/console.json` to the workspace with this JSON

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

4. Add this JSON to the `contributes` section of the `package.json` file to load the snippet when the extension is loaded

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

5. Debug the extension
6. Open the **target-workspace** target project in the debugging instance
7. Use the two snippets to extend the **target-workspace** project
8. Debug the **target-workspace** to show the message appearing in the development instance

## Commands

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

2. Note the handler for the `sayHello` command in `extension.js`

```javascript
var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World!');
});
```

3. Put a breakpoint on the handler and run the extension
4. Use `Ctrl-Shift-P` or `Cmd-Shift-P` to open the command palette
5. Type **Hello World** to see the command in the palette
6. Select it and note execution stops on the breakpoint

---

### Demo 3 - Add a new command 

Commands are useful for componentizing and isolating parts of the functionality your extension offers so that it can be called via the **Command Palette** or when users perform certain actions, like clicking on a button in the VS Code toolbar. 

1. Note the `activationEvents` section in `package.json`

```json
"activationEvents": [
    "onCommand:extension.sayHello"
]
```

2. With this setting the extension won't activate **until** the `sayHello` command is called, so it needs to be changed so that the extension activates right away. Optionally, we could just add the various commands that could activate the extension. 

```json
"activationEvents": [
    "*"
],
```

3. Add a new command named `meta.slowProcess` to the `package.json` file

```json
{
    "command": "meta.slowProcess",
    "title": "Run Slow Process"
}
```

4. Create a new directory named `commands` in the project and add a file to it named `slowProcess.js`

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

5. In the `extension.js` file, wire up the command handler after the `sayHello` command has been registered. 

```javascript
var slowProcess = require('./commands/slowProcess.js');
slowProcess(context);
```

6. Debug the extension and use `Ctrl-Shift-P` or `Cmd-Shift-P` to run command titled `Run Slow Process`

## User Experience

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

2. Debug the extension and run the `slowProcess` command a few times. Once with the output window entirely closed, once with a different channel selected. Note how the `outputChannel.show()` method could be used to make for a less-intrusive experience when providing the user feedback. 

--- 

### Demo 5 - Adding buttons to the toolbar

Once commands are working in an extension a good way to trigger them is with a button in the toolbar. 

1. Show the list of icons in the [octicon](https://octicons.github.com/). Point out this icon library ships with VS Code and the icon names are used to specify which button icon should be shown.

2. Create a new file `utils\toolbar.js` in the workspace and add this code to it. This will componentize the toolbar so it can be used throughout the extension's codebase. 

```javascript
var vscode = require('vscode');

module.exports = {
    addButton: function (command, text, tooltip) {
        var customStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        customStatusBarItem.color = 'white';
        customStatusBarItem.command = command;
        customStatusBarItem.text = text;
        customStatusBarItem.tooltip = tooltip;
        customStatusBarItem.show();
    }
}
```

3. A command should be able to add itself to the toolbar rather than be centralized, so the `toolbar` will be referenced from the `slowProcess.js`. 

```javascript
var toolbar = require('../utils/toolbar.js');
```

4. The command name needs to be passed to the `addButton` method, so it can be extracted to a variable. This updated code for `slowProcess.js` is below.

```javascript
module.exports = exports = function (context) {
    var commandName = 'meta.slowProcess';
    var disposable = vscode.commands.registerCommand(commandName, function () {
        var outputChannel = vscode.window.createOutputChannel(outputChannelName);
        outputChannel.show(false);
        outputChannel.appendLine('Starting the slow process...');

        setTimeout(() => {
            outputChannel.appendLine('Process complete');
        }, 3000);
    });

    context.subscriptions.push(disposable);
    
    toolbar.addButton(commandName, '$(bug)', 'Submit a bug');
}
```

5. Debug the extension and show how the button is present and how clicking it causes the `slowProcess` command to fire. 

---

### Demo 6 - Giving the user options

Intrinsic validation in the form of drop-down lists is a great way to enable users to interface with your extension. 

1. Change the code in the `slowProcess` so that the user needs to confirm the command's execution. 

```javascript
var vscode = require('vscode');
var toolbar = require('../utils/toolbar.js');

const outputChannelName = 'META';
const startConfirmYes = 'Yes, start the process';
const startConfirmNo = 'Actually, nevermind';

module.exports = exports = function (context) {
    var commandName = 'meta.slowProcess';
    var disposable = vscode.commands.registerCommand(commandName, function () {

        vscode.window
            .showQuickPick([startConfirmYes, startConfirmNo])
            .then((selected) => {
                if (selected == startConfirmYes) {
                    var outputChannel = vscode.window.createOutputChannel(outputChannelName);
                    outputChannel.show(false);
                    outputChannel.appendLine('Starting the slow process...');

                    setTimeout(() => {
                        outputChannel.appendLine('Process complete');
                    }, 3000);
                }
            });
    });

    context.subscriptions.push(disposable);

    toolbar.addButton(commandName, '$(bug)', 'Submit a bug');
}
```

2. The `showQuickPick` method is called, by passing an array of strings as a parameter. 
3. Once the user makes a selection (or hits ESC), the method passed to `then` is called. 

### Demo 7 - Collection, confirmation, and error dialogs

Data can be collected from the user, and dialogs to inform the user of events or of error states can be shown. 

1. Replace the code from `slowProcess.js` to match the code below. 

```javascript
var vscode = require('vscode');
var toolbar = require('../utils/toolbar.js');

const outputChannelName = 'META';
const startConfirmYes = 'Yes, start the process';
const startConfirmNo = 'Actually, nevermind';
const password = 'secret';

module.exports = exports = function (context) {
    var commandName = 'meta.slowProcess';
    var disposable = vscode.commands.registerCommand(commandName, function () {

        vscode.window
            .showInputBox({
                password: true,
                prompt: 'Enter the password'
            })
            .then((value) => {
                if (value == password) {
                    vscode.window
                        .showQuickPick([startConfirmYes, startConfirmNo])
                        .then((selected) => {
                            if (selected == startConfirmYes) {
                                var outputChannel = vscode.window.createOutputChannel(outputChannelName);
                                outputChannel.show(false);
                                outputChannel.appendLine('Starting the slow process...');

                                setTimeout(() => {
                                    vscode.window.showInformationMessage('Process complete!')
                                }, 3000);
                            }
                        });
                }
                else {
                    vscode.window.showErrorMessage('Incorrect password');
                }
            });
    });

    context.subscriptions.push(disposable);

    toolbar.addButton(commandName, '$(bug)', 'Submit a bug');
}
```

2. Run the demo and show how data can be collected and used in the extension's logic flow. 

## Editor interaction

### Demo 8 - Text decorations

The text in the active editor document can be used as an object that you can parse and decorate. Colorizers, decorators, and code lens providers are a few of the various ways you can use the text editor in creative ways. 

1. Add a new file to the workspace named `utils\decoration.js` and insert the following code into it. The `createTextEditorDecorationType` creates a decoration object representing how the specified text should appear in the editor. 

```javascript
var vscode = require('vscode');

exports.activate = (context, searchTerms) => {
    var termDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderSpacing: '2px',
        borderStyle: 'solid',
        backgroundColor: '#2572E5',
        color: 'white',
        cursor: 'pointer'
    });
}
```

2. Add this code to the `utils\decoration.js` file's `activate` method to provide a method to update the active editor's text's display with a decoration, and another method that can be used within event handlers later to update when users type or open new documents. 

```javascript
var timeout = null;
var activeEditor = vscode.window.activeTextEditor;

function triggerUpdateDecorations() {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(updateDecorations, 500);
}

function updateDecorations() {
    if (!activeEditor) {
        return;
    }

    var documentText = activeEditor.document.getText();
    var regExpFromArray = new RegExp(searchTerms.join('|'), 'gi');
    var matchedStrings = [];
    var match;

    while (match = regExpFromArray.exec(documentText)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const decoration = {
            range: new vscode.Range(startPos, endPos),
            color: '#FFFFFF'
        };
        matchedStrings.push(decoration);
    }

    activeEditor.setDecorations(termDecorationType, matchedStrings);
}

if (activeEditor) {
    triggerUpdateDecorations();
}
```

3. Next, add handlers for the editor window's `onDidChangeActiveTextEditor` and `onDidChangeTextDocument` events, during which the document's decorations will ne updated. 

```javascript
vscode.window.onDidChangeActiveTextEditor(editor => {
    activeEditor = editor;
    if (editor) {
        triggerUpdateDecorations();
    }
}, null, context.subscriptions);

vscode.workspace.onDidChangeTextDocument(event => {
    if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations();
    }
}, null, context.subscriptions);
```

4. The last step in getting the decorations lit up is to wire it up in the `extension.js` file. First, pull in the `decoration.js` functionality:

```javascript
var decoration = require('./utils/decoration.js');
```

5. Then, call the `decoration.activate` method in the `extension.activate` method so that the extension begins watching the editor for document changes or edits. 

```javascript
// decorate the important words in the doc
var searchTerms = ['Slovenia', 'NTK', 'Microsoft'];
decoration.activate(context, searchTerms);
```

6. Once these changes are made, debug the extension. During the debugging session, create a new text file and enter a phrase like "NTK Slovenia is a great Microsoft conference" and note how the desired words are decorated. 

## Publishing extensions to the Visual Studio Marketplace

Publishing extensions, and updating them, is as easy as running the VSCE command included with the [Visual Studio Code Extension Manager](https://www.npmjs.com/package/vsce) npm package. 

### Packaging extensions using vsce

1. Hit **Ctrl-\`** to open the integrated terminal window. 

1. Check the `version` property in the extension folder's `package.json` file to make sure the version is desirable. 

1. Enter the command `vsce package` in the root of the extension project's workspace. Note that a file with the filename format `{extension-name}-{version}.vsix` will be created. 

    > Note: If you haven't customized the README.md file in the extension root you'll see an error message. The README.md file will be used to inform your potential users what value your extension offers them, so take time to customize it. 

### Publishing extensions to the marketplace

1. Login to the marketplace using your Microsoft account. The URL format should be `https://marketplace.visualstudio.com/manage/publishers/{your-publisher-name}`

1. Show the slides on publishing an extension (or updating it to a new version) in the PowerPoint deck in this repository, then walk through the process with the extension you build during the session. 

    > Note: If you chose a name for your demo extension that's unavailable, rename it in the `package.json` file, re-tun `vsce package`, and re-publish it. 

### Installing your extension 

1. Open the **Extensions** palette in VS Code.
1. Search for the name of your extension. 

    > Note how the `changelog.md` file is reflected on the `CHANGELOG` tab in the **Extensions** palette. Point out that **every version update should have an entry** and stress that potential customers will use this to determine how confident they are that you'll keep them informed. 

1. Install it!