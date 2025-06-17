import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import User from '@/models/user';

export async function POST(req) {
  await DbConnect();
  try {
    const data = await req.json();

    // Correct MongoDB query to find all users except the one with the given userid
    const users = await User.find({ userid: { $ne: data.userid } });

    return NextResponse.json({ success: true, users }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
