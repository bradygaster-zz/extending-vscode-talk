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

    var activeEditor = vscode.window.activeTextEditor;
    var timeout = null;
    
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
};