import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Group from '@/models/group';

export async function POST(req) {
  await DbConnect();

  try {
    const data = await req.json();
    const { checkid } = data;

    if (!checkid) {
      return NextResponse.json(
        { success: false, message: 'Missing checkid in request' },
        { status: 400 }
      );
    }

    // Find groups where the user is either the creator or a member
    const groups = await Group.find({
      $or: [
        { creatorid: checkid },
        { 'members.userid': checkid }
      ]
    });

    return NextResponse.json({ success: true, groups }, { status: 200 });

  } catch (error) {
    console.error('Error fetching groups by userid:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
