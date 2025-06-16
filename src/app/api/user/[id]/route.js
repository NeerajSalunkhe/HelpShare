import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import User from '@/models/user';

export async function GET(req, { params }) {
  await DbConnect();

  const userid = params.id;

  if (!userid) {
    return NextResponse.json(
      { success: false, message: 'userid param is required' },
      { status: 400 }
    );
  }

  try {
    const user = await User.findOne({ userid });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
