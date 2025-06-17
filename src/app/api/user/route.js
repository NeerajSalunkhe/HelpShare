import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import User from '@/models/user';

export async function POST(req) {
  await DbConnect();

  try {
    const data = await req.json();
    const { userid } = data;

    if (!userid) {
      return NextResponse.json(
        { success: false, message: 'userid is required' },
        { status: 400 }
      );
    }

    const update = {};

    if (data.username !== undefined) update.username = data.username;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.email !== undefined) update.email = data.email;
    if (data.razorpay_key_id !== undefined) update.razorpay_key_id = data.razorpay_key_id;
    if (data.razorpay_secret !== undefined) update.razorpay_secret = data.razorpay_secret;

    const user = await User.findOneAndUpdate(
      { userid },
      { $set: update },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message:
        user.createdAt.getTime() === user.updatedAt.getTime()
          ? 'Created new user'
          : 'Updated existing user',
      user,
    });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
