
**High-Level Architecture**
┌────────────────────┐
│ VS Code Extension  │
└──────────┬─────────┘
           │ Activation
           ▼
┌────────────────────────┐
│ Commands (review file) │
└──────────┬─────────────┘
           │ Sends prompt
           ▼
┌──────────────────────────────────────┐
│  GitHub Copilot LLM                  │
└──────────┬───────────────────────────┘
           │ Pure JSON output
           ▼
┌──────────────────────┐
│ Parse JSON           │
│ Show Diagnostics     │
│ Show Webview Report  │
└──────────────────────┘

## Features

✔ Reviews any open file using Copilot’s LLM
✔ Applies company-wide coding rules (loaded from ai-review-instructions.md)
✔ Generates a JSON-only report (summary + issues)
✔ Highlights issues directly inside the editor
✔ Shows a professional Webview panel summarizing all issues
✔ Allows manually pasting JSON and rendering the UI
✔ Uses VS Code Diagnostics as inline warnings/errors
✔ Integrates with GitHub Copilot Chat UI



---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**


