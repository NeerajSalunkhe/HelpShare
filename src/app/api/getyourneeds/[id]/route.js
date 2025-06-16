import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Need from '@/models/need';

export async function POST(req, { params }) {
  await DbConnect();

  const userid = params.id;

  if (!userid) {
    return NextResponse.json(
      { success: false, message: 'userid param is required' },
      { status: 400 }
    );
  }

  try {
    const needs = await Need.find({ userid });

    if (!needs || needs.length === 0) {
      return NextResponse.json({ success: false, message: 'No needs found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, needs }); // ✅ fixed key name
  } catch (error) {
    console.error('Error fetching needs:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
