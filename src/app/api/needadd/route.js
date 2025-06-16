import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Need from '@/models/need';
import { nanoid } from 'nanoid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  await DbConnect();

  try {
    const form = await req.formData();

    const userid = form.get('userid');
    const fullName = form.get('fullName');
    const mainReason = form.get('mainReason');
    const description = form.get('description');
    const requiredAmountRaw = form.get('requiredAmount');
    const needid = form.get('needid');

    const proof1File = form.get('proofImage1'); // ✅ fixed name
    const proof2File = form.get('proofImage2'); // ✅ fixed name

    const requiredAmount = parseFloat(requiredAmountRaw);
    const proofImage1 = await fileToBase64(proof1File);
    const proofImage2 = await fileToBase64(proof2File);

    const existingNeed = needid ? await Need.findOne({ needid }) : null;

    if (existingNeed) {
      return NextResponse.json({
        success: true,
        message: 'Need already exists',
        need: existingNeed,
      });
    }

    if (
      !userid ||
      !fullName ||
      !mainReason ||
      !description ||
      isNaN(requiredAmount) ||
      !proofImage1 ||
      !proofImage2
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newNeed = await Need.create({
      userid,
      needid: needid || nanoid(),
      fullName,
      mainReason,
      description,
      requiredAmount,
      proofImage1,
      proofImage2,
      helps: [],
      collectedAmount: 0,
    });

    return NextResponse.json({
      success: true,
      message: 'New need created',
      need: newNeed,
    });

  } catch (err) {
    console.error('Error in needadd route:', err);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

async function fileToBase64(file) {
  if (!file || typeof file.arrayBuffer !== 'function') return null;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Set proper MIME type — assuming JPEG
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

