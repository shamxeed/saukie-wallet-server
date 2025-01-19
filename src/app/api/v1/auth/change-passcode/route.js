import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { omit } from '@/server/helpers';
import { decrypt, encrypt } from '@/server/encryption';

export async function POST(request) {
  const body = await request.json();

  const { email, new_passcode, old_passcode } = body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { passcode: true },
    });

    const payload = await decrypt({ token: user.passcode });

    const isMatch = payload.passcode === old_passcode;

    if (!isMatch) {
      return NextResponse.json({ msg: 'Wrong Passcode!' }, { status: 401 });
    }

    const passcode = await encrypt({ data: { passcode: new_passcode } });

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
