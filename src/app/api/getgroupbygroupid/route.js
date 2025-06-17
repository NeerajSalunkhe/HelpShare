import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Group from '@/models/group';

export async function POST(req) {
  await DbConnect();
  try {
    const { groupid } = await req.json();

    const group = await Group.findOne({ groupid });

    if (!group) {
      return NextResponse.json({
        success: false,
        message: 'Group not found',
      });
    }

    return NextResponse.json({
      success: true,
      group: {
        groupid: group.groupid,
        creatorid: group.creatorid,
        description: group.description,
        amount: group.amount,
        collectedamount: group.collectedamount,
        members: group.members,
      },
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
