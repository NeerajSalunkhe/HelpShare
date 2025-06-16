import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Need from '@/models/need';

export async function POST(req, { params }) {
  await DbConnect();

  const needid = params?.id;

  if (!needid) {
    return NextResponse.json(
      { success: false, message: 'needid param is required' },
      { status: 400 }
    );
  }

  try {
    const needs = await Need.find({ needid });

    if (!needs || needs.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No needs found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, needs });
  } catch (error) {
    console.error('Error fetching needs:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
