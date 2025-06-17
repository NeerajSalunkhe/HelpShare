//src/app/addpersonalpayment/route.js
import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Personal from '@/models/personal';

export async function POST(req) {
  try {
    await DbConnect();

    const body = await req.json();
    const { userid, username, useremail, paytoyou, paytohim } = body;

    if (!userid || (!paytoyou && !paytohim)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find if a personal document already exists for this userid
    const existing = await Personal.findOne({ userid });

    if (existing) {
      if (paytoyou) {
        existing.paytoyou.push(paytoyou);
      }
      if (paytohim) {
        existing.paytohim.push(paytohim);
      }

      await existing.save();
      return NextResponse.json({ success: true, message: 'Payment added to existing record' });
    } else {
      // Create new document
      const newPersonal = new Personal({
        userid,
        username,
        useremail,
        paytoyou: paytoyou ? [paytoyou] : [],
        paytohim: paytohim ? [paytohim] : [],
      });

      await newPersonal.save();
      return NextResponse.json({ success: true, message: 'New personal payment record created' });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
