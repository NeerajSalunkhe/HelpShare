import Chat from '@/models/chat';
import DbConnect from '@/lib/DbConnect';

export async function GET(_, { params }) {
  const { requestId } = params;
  await DbConnect();

  const chat = await Chat.findOne({ requestId });

  return Response.json({ success: true, messages: chat?.messages || [] });
}
