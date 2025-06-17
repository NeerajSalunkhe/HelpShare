'use client';

import { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import nProgress from 'nprogress';
export default function ChatBox({ requestId, ownerId, onClose }) {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);

  const currentUserId = isLoaded && user ? user.id : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`chat-${requestId}`);
    channel.bind('message', function (data) {
      setMessages(prev => {
        const exists = prev.find(m => m._id === data._id);
        return exists ? prev : [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [requestId]);

  useEffect(() => {
    const loadMessages = async () => {
      nProgress.start();
      try {
        const res = await fetch(`/api/chat/history/${requestId}`);
        const data = await res.json();
        if (data.success) setMessages(data.messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        nProgress.done();
      }
    };
    loadMessages();
  }, [requestId]);
  const [tempdis, setTempdis] = useState(false);
  const sendMessage = async () => {
    if (!message.trim()) return;
    nProgress.start();
    setTempdis(true);
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId || null,
          userName: currentUserId ? user?.fullName : 'Anonymous',
          message,
          requestId,
        }),
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      nProgress.done();
      setTempdis(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md sm:rounded-l-xl sm:h-[90vh] h-full bg-white dark:bg-zinc-900 flex flex-col shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">💬 Chat</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {messages.map((msg, i) => {
            let displayName = msg.senderId === ownerId ? 'Owner' : msg.senderName || 'Anonymous';
            return (
              <div key={msg._id || i}>
                {
                  (msg.senderId === ownerId) ? (<strong className="text-blue-400 dark:text-blue-400">{displayName}:</strong>) : (<strong className="text-red-500 dark:text-red-400">{displayName}:</strong>)
                }
                <span className="text-gray-700 dark:text-gray-100">{msg.message}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            className="flex-grow border px-3 py-1 rounded dark:bg-zinc-800 dark:text-white"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
            disabled={tempdis}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
