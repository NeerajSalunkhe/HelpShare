import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Group from '@/models/group';

export async function POST(req) {
  await DbConnect();

  try {
    const { groupid, userid } = await req.json();

    if (!groupid || !userid) {
      return NextResponse.json(
        { success: false, message: 'Missing groupid or userid' },
        { status: 400 }
      );
    }

    const group = await Group.findOne({ groupid });

    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group not found' },
        { status: 404 }
      );
    }

    const member = group.members.find(m => m.userid === userid);
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'User is not a member of this group' },
        { status: 404 }
      );
    }

    if (member.paymentdone) {
      return NextResponse.json({
        success: true,
        message: 'Payment already marked as done',
      });
    }

    member.paymentdone = true;
    await group.save();

    return NextResponse.json({
      success: true,
      message: 'Payment marked as done successfully',
      group,
    });

  } catch (err) {
    console.error('Error in addpaymentdone route:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
