import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Personal from '@/models/personal';

export async function POST(req) {
  try {
    await DbConnect();
    const { userid, id, payeremail } = await req.json();

    if (!userid || !id || !payeremail) {
      return NextResponse.json({ error: 'Missing userid, id, or payeremail' }, { status: 400 });
    }

    const personalDoc = await Personal.findOne({ userid });
    if (!personalDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const payEntry = personalDoc.paytoyou.find(entry => entry.id === id);
    if (!payEntry) {
      return NextResponse.json({ error: 'paytoyou entry not found' }, { status: 404 });
    }

    payEntry.payeremail = payeremail;
    await personalDoc.save();

    return NextResponse.json({ success: true, message: 'Email updated successfully' });
  } catch (err) {
    console.error('Error in /api/updatedemail:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
