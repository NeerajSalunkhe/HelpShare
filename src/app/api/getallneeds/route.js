import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Need from '@/models/need';

export async function POST() {
  await DbConnect();

  try {
    const needs = await Need.find().sort({ createdAt: -1 }); // ⬅️ Optional: newest first

    if (!needs || needs.length === 0) {
      return NextResponse.json(
        { success: true, needs: [] }, // ⬅️ Return empty list instead of 404
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, needs }, { status: 200 });

  } catch (error) {
    console.error('Error fetching needs:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
