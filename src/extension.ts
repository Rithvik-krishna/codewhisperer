import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });   // ✅ loads the real file

import * as vscode from 'vscode';
import * as fs from 'fs';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('codewhisperer.openChat', () => {
    const panel = vscode.window.createWebviewPanel(
      'codeWhispererChat',
      'CodeWhisperer Chat',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))],
      }
    );

    const mediaPath = path.join(context.extensionPath, 'media');
    const bundleUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(mediaPath, 'bundle.js')));
    const htmlPath = path.join(mediaPath, 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    html = html.replace('bundle.js', bundleUri.toString());
    panel.webview.html = html;

    panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.type === 'sendPrompt') {
          const prompt = message.value;
          console.log('📩 Prompt received:', prompt);

          try {
            const response = await fetch('https://api.together.xyz/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
              },
              body: JSON.stringify({
                model: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // Or any supported model
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 150,
              }),
            });

            type TogetherResponse = {
              choices?: { message: { content: string } }[];
              error?: { message: string };
            };

            const data = (await response.json()) as TogetherResponse;

            if (data.error) {
              console.error('❌ Together.ai Error:', data.error.message);
              panel.webview.postMessage({
                sender: 'ai',
                content: `❌ Together.ai Error: ${data.error.message}`,
              });
              return;
            }

            const reply = data.choices?.[0]?.message?.content?.trim() || 'No response from Together.ai';
            panel.webview.postMessage({
              sender: 'ai',
              content: reply,
            });

          } catch (err: any) {
            console.error('❌ Network/API error:', err);
            panel.webview.postMessage({
              sender: 'ai',
              content: '❌ Failed to contact Together.ai.',
            });
          }
        }
      },
      undefined,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}
