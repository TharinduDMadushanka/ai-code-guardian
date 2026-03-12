"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
var diagnosticCollection = vscode.languages.createDiagnosticCollection("ai-guardian");
async function loadInstructions() {
  const configPath = vscode.workspace.getConfiguration("aiCodeGuardian").get("instructionsPath") || "ai-review-instructions.md";
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showWarningMessage("No workspace open \u2014 using default rules.");
    return getDefaultInstructions();
  }
  const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, configPath);
  try {
    const content = await fs.promises.readFile(fileUri.fsPath, "utf-8");
    const trimmed = content.trim();
    if (trimmed) {
      console.log(`Loaded custom instructions from: ${configPath}`);
      return trimmed;
    }
  } catch (err) {
    console.warn("Could not load instructions file:", err);
  }
  vscode.window.showInformationMessage("Using default AI review rules (create ai-review-instructions.md to customize).");
  return getDefaultInstructions();
}
function getDefaultInstructions() {
  return `# Default AI Review Rules (Personal Version)
- Use const/let instead of var
- No console.log / console.error in production code
- Prefer arrow functions for callbacks
- Always wrap async functions in try/catch
- Validate all user inputs / API responses
- Add JSDoc comments for public functions
- Avoid magic numbers/strings \u2014 use named constants
- Prefer early returns over deep nesting
- Keep functions short (< 50 lines when possible)
- Write clear, descriptive variable/function names`;
}
function showReviewPanel(review, fileName) {
  const panel = vscode.window.createWebviewPanel(
    "aiReview",
    `AI Review: ${fileName}`,
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );
  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: var(--vscode-editor-font-family); padding: 20px; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); line-height: 1.6; }
            h1 { color: #4fc3f7; border-bottom: 2px solid #4fc3f7; padding-bottom: 8px; }
            .summary { font-style: italic; margin: 15px 0; padding: 10px; background: #00000033; border-radius: 6px; }
            .issue { margin: 15px 0; padding: 15px; border-radius: 8px; background: var(--vscode-input-background); border-left: 5px solid; }
            .error   { border-color: #f48771; }
            .warning { border-color: #ffb74d; }
            .info    { border-color: #81c784; }
            .line    { font-weight: bold; color: #fff176; font-size: 0.9em; }
            .suggestion { margin-top: 8px; font-style: italic; color: #81c784; }
        </style>
    </head>
    <body>
        <h1>AI Code Guardian Review</h1>
        <div class="summary"><strong>Summary:</strong> ${review.summary || "No summary provided"}</div>
        <h2>${review.issues.length} Issue(s) Found</h2>
        ${review.issues.map((i) => `
            <div class="issue ${i.severity}">
                <div class="line">Line ${i.line} \u2014 ${i.severity.toUpperCase()}</div>
                <div><strong>${i.message}</strong></div>
                ${i.suggestion ? `<div class="suggestion">Fix: ${i.suggestion}</div>` : ""}
            </div>
        `).join("") || "<p>Clean code! No issues found</p>"}
    </body>
    </html>`;
}
function activate(context) {
  console.log("AI Code Guardian \u2014 Personal Edition \u2014 Activated");
  const showReviewFromJSON = vscode.commands.registerCommand("ai-code-guardian.showReviewFromJson", async () => {
    const jsonStr = await vscode.window.showInputBox({
      prompt: "Paste Copilot JSON review here",
      placeHolder: '{"summary": "...", "issues": [...]}'
    });
    if (!jsonStr)
      return;
    try {
      const review = JSON.parse(jsonStr);
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const fileName = path.basename(editor.document.fileName);
        const diagnostics = review.issues.map((issue) => {
          const line = Math.max(0, issue.line - 1);
          const range = new vscode.Range(line, 0, line, 999);
          const severity = issue.severity === "error" ? vscode.DiagnosticSeverity.Error : issue.severity === "warning" ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information;
          const diag = new vscode.Diagnostic(range, issue.message, severity);
          diag.source = "AI Guardian";
          if (issue.suggestion)
            diag.code = issue.suggestion;
          return diag;
        });
        diagnosticCollection.set(editor.document.uri, diagnostics);
        showReviewPanel(review, fileName);
      }
    } catch (e) {
      vscode.window.showErrorMessage("Invalid JSON: " + e.message);
    }
  });
  const reviewFileCommand = vscode.commands.registerCommand("ai-code-guardian.reviewFile", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("Open a file first!");
      return;
    }
    const doc = editor.document;
    const code = doc.getText();
    const fileName = path.basename(doc.fileName);
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Reviewing with AI...",
      cancellable: false
    }, async () => {
      try {
        const instructions = await loadInstructions();
        const prompt = `You are an expert senior engineer doing a strict code review.

Return ONLY valid JSON \u2014 no markdown, no explanations, no extra text:

{
  "summary": "One sentence overall feedback",
  "issues": [
    {
      "line": 5,
      "severity": "error|warning|info",
      "message": "Clear description of the issue",
      "suggestion": "How to fix it"
    }
  ]
}

Personal Rules & Guidelines:
${instructions}

File: ${fileName} (${doc.languageId})

Code:
\`\`\`${doc.languageId}
${code}
\`\`\``;
        const models = await vscode.lm.selectChatModels({ vendor: "copilot" });
        if (models.length === 0) {
          throw new Error("GitHub Copilot not available. Please sign in.");
        }
        const model = models[0];
        const messages = [vscode.LanguageModelChatMessage.User(prompt)];
        const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
        let fullText = "";
        for await (const fragment of response.text) {
          fullText += fragment;
        }
        let jsonStr = fullText.trim().replace(/^```json\s*/, "").replace(/```$/, "");
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON returned from AI");
        }
        const review = JSON.parse(jsonMatch[0]);
        const diagnostics = review.issues.map((issue) => {
          const line = Math.max(0, issue.line - 1);
          const range = new vscode.Range(line, 0, line, 999);
          const severity = issue.severity === "error" ? vscode.DiagnosticSeverity.Error : issue.severity === "warning" ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information;
          const diag = new vscode.Diagnostic(range, issue.message, severity);
          diag.source = "AI Guardian";
          if (issue.suggestion)
            diag.code = issue.suggestion;
          return diag;
        });
        diagnosticCollection.set(doc.uri, diagnostics);
        if (vscode.workspace.getConfiguration("aiCodeGuardian").get("showReviewPanel", true)) {
          showReviewPanel(review, fileName);
        }
        vscode.window.showInformationMessage(`Review complete: ${review.issues.length} issue(s) found`);
      } catch (err) {
        vscode.window.showErrorMessage("Review failed: " + err.message);
        console.error(err);
      }
    });
  });
  context.subscriptions.push(reviewFileCommand, showReviewFromJSON);
}
function deactivate() {
  diagnosticCollection.clear();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
