import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import * as mailer from '@/server/mailer';

export async function POST(req) {
  const body = await req.json();

  const { email, isPassword } = body;

  try {
    const code = Math.floor(Math.random() * 1000000);

    await prisma.otp.upsert({
      where: { user_email: email },
      update: {
        code,
        is_valid: true,
      },
      create: {
        code,
        is_valid: true,
        user_email: email,
      },
    });

    const html = mailer.createHTMLTamplate({ ...body, code });

    const mailOption = {
      html,
      to: email,
      from: mailer.sender,
      subject: isPassword ? 'Password Reset' : 'Confirm Your Email Address',
    };

    await mailer.sendMailAsync(mailOption);

    return NextResponse.json({
      msg: 'New OTP has been successfully sent to your email!',
    });
  } catch (err) {
    console.log(err.message);

    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
