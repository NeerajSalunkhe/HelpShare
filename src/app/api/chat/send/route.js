import Chat from '@/models/chat';
import DbConnect from '@/lib/DbConnect';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  const body = await req.json();
  const { userId, userName, message, requestId } = body;

  await DbConnect();

  // Save message in MongoDB
  const chat = await Chat.findOneAndUpdate(
    { requestId },
    { $push: { messages: { senderId: userId, senderName: userName, message } } },
    { upsert: true, new: true }
  );

  // Trigger via Pusher
  await pusher.trigger(`chat-${requestId}`, 'message', {
    senderName: userName,
    message,
  });

  return Response.json({ success: true });
}
