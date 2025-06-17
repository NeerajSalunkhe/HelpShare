import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Personal from '@/models/personal';

export async function POST(req) {
  try {
    await DbConnect();
    const { userid, id } = await req.json();

    if (!userid || !id) {
      return NextResponse.json({ error: 'Missing userid or id' }, { status: 400 });
    }

    const user = await Personal.findOne({ userid });
    if (!user) {
      return NextResponse.json({ error: 'Personal not found' }, { status: 404 });
    }

    const index = user.paytohim.findIndex(entry => entry.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Payment entry not found' }, { status: 404 });
    }

    // Toggle the setreminder boolean
    user.paytohim[index].setreminder = !user.paytohim[index].setreminder;

    await user.save();

    return NextResponse.json({
      success: true,
      updatedReminderState: user.paytohim[index].setreminder
    }, { status: 200 });

  } catch (err) {
    console.error('Error toggling setreminder:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
