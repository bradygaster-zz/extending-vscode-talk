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