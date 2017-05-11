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