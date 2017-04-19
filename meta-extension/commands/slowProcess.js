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