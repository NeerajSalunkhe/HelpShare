import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Personal from '@/models/personal';

export async function POST(req) {
  try {
    await DbConnect();
    const body = await req.json();
    const { userid } = body;
    if (!userid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const personalData = await Personal.findOne({ userid });
    if (!personalData) {
      return NextResponse.json({ paytohim: [] });
    }
    return NextResponse.json({ paytohim: personalData.paytohim || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
