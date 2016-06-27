'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function onlyWhitespace(text: string): boolean {
    return !/\S/.test(text);
}

function getSelectedParagraph(editor: vscode.TextEditor): vscode.Range {
    let start = editor.selection.active;
    let end = editor.selection.active;
    let current = editor.selection.active;

    // find the first character of the paragraph
    while (current.line > 0 && !onlyWhitespace(editor.document.lineAt(current).text)){
        start = current;
        current = current.translate(-1);
    }
    start = start.with(start.line, 0);

    // find the last character of the paragraph
    const lineCount = editor.document.lineCount;
    while (end.line < lineCount - 1 && !onlyWhitespace(editor.document.lineAt(end).text)) {
        end = end.translate(1);
    }
    end = end.with(end.line, editor.document.lineAt(end).text.length);
    
    return new vscode.Range(start, end);
}

function hardWrapText(text: string, maxLineLen: number): string {
    let lines = "";
    let currentLine = "";
    const words = text.split(/\s/);

    for (let i = 0, len = words.length; i < len; ++i) {
        const word = words[i];
        if (word.length === 0) {
            continue;
        }

        if (currentLine.length + word.length > maxLineLen) {
            lines += currentLine + "\n";
            currentLine = "";
        }

        currentLine += word + " ";
    }
    if (currentLine.length > 0) {
        lines += currentLine + "\n";
    }

    return lines;
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('paragraphHardWrapper.wrap', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)  {
            return;
        }

        let selectedParagraph = getSelectedParagraph(editor);
        const paragraphText = editor.document.getText(selectedParagraph);
        const formattedText = hardWrapText(paragraphText, 80);
        
        editor.edit((editBuilder) => {
            editBuilder.replace(selectedParagraph, formattedText);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}