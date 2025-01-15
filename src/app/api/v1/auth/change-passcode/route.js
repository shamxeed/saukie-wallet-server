import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import prisma from '@/server/prisma';
import { hashPasscode } from '@/server/hashPasscode';
import { omit } from '@/server/helpers';

export async function POST(request) {
  const body = await request.json();

  const { email, new_passcode, old_passcode } = body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { passcode: true },
    });

    const isMatch = await bcrypt.compare(old_passcode, user.passcode);

    if (!isMatch) {
      return NextResponse.json({ msg: 'Wrong Passcode!' }, { status: 401 });
    }

    const passcode = await hashPasscode(new_passcode);

    const userData = await prisma.user.update({
      where: { email },
      data: { passcode },
      omit,
    });

    return NextResponse.json({
      userData,
      api_response: "You've successfully updated your password.",
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
