'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe('chat');
    channel.bind('message', function (data) {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'Neeraj', message }),
    });

    setMessage('');
  };

  return (
    <div className="max-w-xl mx-auto p-4 border rounded">
      <h2 className="font-semibold text-lg mb-4">💬 Live Chat</h2>
      <div className="h-64 overflow-y-auto border p-2 mb-4 bg-gray-50 dark:bg-zinc-800 rounded">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <strong>{msg.user}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-grow border px-3 py-1 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-red-500 text-white px-4 py-1 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
