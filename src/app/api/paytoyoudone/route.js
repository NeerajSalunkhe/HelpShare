import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Personal from '@/models/personal';

export async function POST(req) {
  try {
    await DbConnect();
    const { userid, id } = await req.json();

    if (!userid || !id) {
      return NextResponse.json({ error: 'Missing userid or paytoyou id' }, { status: 400 });
    }

    const personalDoc = await Personal.findOne({ userid });

    if (!personalDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Filter out the paytoyou entry with the given id
    personalDoc.paytoyou = personalDoc.paytoyou.filter(entry => entry.id !== id);

    await personalDoc.save();

    return NextResponse.json({ success: true, message: 'paytoyou entry deleted' });
  } catch (err) {
    console.error('Error in /api/paytoyoudone:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
