'use strict';

import {
    ExtensionContext,
    workspace,
    commands,
    window,
    TextEditor,
    Range
} from 'vscode';

function onlyWhitespace(text: string): boolean {
    return !/\S/.test(text);
}

function getSelectedParagraph(editor: TextEditor): Range {
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

    return new Range(start, end);
}

function addWord(line: string, word: string): string {
    if (line.length === 0) {
        return word;
    }
    else {
        return line + " " + word;
    }
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

        if (currentLine.length + word.length + 1 > maxLineLen) {
            lines += currentLine + "\n";
            currentLine = "";
        }

        currentLine = addWord(currentLine, word);
    }
    if (currentLine.length > 0) {
        lines += currentLine + "\n";
    }

    return lines;
}

export function activate(context: ExtensionContext) {
    let disposable = commands.registerCommand('paragraphHardWrapper.wrap', () => {
        const editor = window.activeTextEditor
        if (!editor)  {
            return;
        }

        // Get the smallest ruler
        const rulers: Array<number> = workspace.getConfiguration('editor').get('rulers');
        let maxLen: number = workspace.getConfiguration('paragraphHardWrapper').get('defaultWrapColumn');
        if (rulers.length > 0) {
            maxLen = rulers.sort((a, b) => b - a)[0];
        }

        let selectedParagraph = getSelectedParagraph(editor);
        const paragraphText = editor.document.getText(selectedParagraph);
        const formattedText = hardWrapText(paragraphText, maxLen);

        editor.edit((editBuilder) => {
            editBuilder.replace(selectedParagraph, formattedText);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}
