import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Group from '@/models/group';
import User from '@/models/user';

export async function POST(req) {
  await DbConnect();
  try {
    const { groupid, userid } = await req.json();

    if (!groupid || !userid) {
      return NextResponse.json({
        success: false,
        message: 'Missing groupid or userid',
      });
    }

    const group = await Group.findOne({ groupid });
    if (!group) {
      return NextResponse.json({
        success: false,
        message: 'Group not found',
      });
    }

    // Prevent duplicate members
    if (group.members.some((m) => m.userid === userid)) {
      return NextResponse.json({
        success: false,
        message: 'User already in group',
      });
    }

    const user = await User.findOne({ userid });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      });
    }

    group.members.push({
      userid,
      name: user.username || '',
      phone: user.phone || '',
      email: user.email || '',
      paymentdone: false,
      status: 'notdone', 
    });


    await group.save();

    return NextResponse.json({
      success: true,
      message: 'User added to group',
      group,
    });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
