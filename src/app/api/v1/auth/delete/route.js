import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { decrypt } from '@/server/encryption';

const api_response =
  'Your request to delete your account has been received successfully and will be deleted in the next 30 days.';

export async function POST(req) {
  try {
    const { email, passcode } = await req.json();

    const user = await prisma.user.findFirst({
      where: { email },
      select: { passcode: true },
    });

    if (!user) {
      return NextResponse.json(
        { msg: 'Invalid details provided!' },
        { status: 401 }
      );
    }

    const payload = await decrypt({ token: user.passcode });

    if (payload.passcode !== passcode) {
      return NextResponse.json(
        { msg: 'Invalid details provided!' },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'DELETED' },
    });

    return NextResponse.json({ api_response });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
