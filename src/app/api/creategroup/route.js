import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Group from '@/models/group';

export async function POST(req) {
  await DbConnect();
  try {
    const { groupid, creatorid, description, amount } = await req.json(); // ✅ FIXED

    // Validate required fields
    if (!groupid || !creatorid || !description || !amount || isNaN(Number(amount))) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Check if group already exists
    const existingGroup = await Group.findOne({ groupid });
    if (existingGroup) {
      return NextResponse.json({
        success: false,
        message: 'Group with this ID already exists',
      });
    }

    // Create new group
    const newGroup = await Group.create({
      groupid,
      creatorid,
      description,
      amount: Number(amount),
      collectedamount: 0,
      members: [],
    });

    return NextResponse.json({
      success: true,
      message: 'New group created',
      group: newGroup,
    });

  } catch (err) {
    console.error('Error in creategroup route:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
