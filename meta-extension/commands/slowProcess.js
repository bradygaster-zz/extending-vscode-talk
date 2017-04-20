var vscode = require('vscode');

var toolbar = require('../utils/toolbar.js');

const outputChannelName = 'META';

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