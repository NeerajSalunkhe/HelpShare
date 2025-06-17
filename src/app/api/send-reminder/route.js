import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { from, to, subject, text } = body;

    if (!from || !to || !subject || !text) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      });
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from, // will still send as process.env.GMAIL_USER but this sets reply-to/name
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return new Response(JSON.stringify({ error: 'Email send failed' }), {
      status: 500,
    });
  }
}
