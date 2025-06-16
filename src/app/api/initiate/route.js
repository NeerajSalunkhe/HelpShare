// app/api/initiate/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/DbConnect';
import { initiate } from '../../../../actions/useractions';

export async function POST(req) {
  try {
    const { owner, form, id } = await req.json();
    await dbConnect();

    const order = await initiate(owner, form, id); // Your logic here
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
