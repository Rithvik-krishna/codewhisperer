import React, { useState, useEffect } from 'react';
import './style.css'; // optional for styling

declare function acquireVsCodeApi(): {
  postMessage: (msg: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const vscode = acquireVsCodeApi();

export default function App() {
  const [messages, setMessages] = useState<{ sender: string, content: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    vscode.postMessage({ type: 'sendPrompt', value: input });
    setMessages([...messages, { sender: 'user', content: input }]);
    setInput('');
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;
      if (message.sender === 'ai') {
        setMessages(prev => [...prev, { sender: 'ai', content: message.content }]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((msg, i) => (
          <div key={i}><b>{msg.sender}:</b> {msg.content}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        placeholder="Type your message..."
        style={{ width: '100%', padding: '6px', fontSize: 14 }}
      />
    </div>
  );
}
