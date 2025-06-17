// app/api/handleedit/route.js
import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Group from '@/models/group';

export async function POST(req) {
  await DbConnect();

  try {
    const { groupid, userid, status } = await req.json();

    if (!groupid || !userid || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    const memberIndex = group.members.findIndex((m) => m.userid === userid);
    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Member not found in group' },
        { status: 404 }
      );
    }

    // Update status
    group.members[memberIndex].status = status;

    // If marked as done, mark paymentdone = true and update collected amount
    if (status === 'done') {
      group.members[memberIndex].paymentdone = true;
      const perMemberAmount = Math.ceil(group.amount / (group.members.length || 1));
      group.collectedamount += perMemberAmount;
    }

    // Optional: set paymentdone to false if status is notdone
    if (status === 'notdone') {
      group.members[memberIndex].paymentdone = false;
    }

    await group.save();

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
