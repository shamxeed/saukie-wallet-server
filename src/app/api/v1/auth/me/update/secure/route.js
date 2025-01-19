import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { omit } from '@/server/helpers';
import { getUserId } from '@/server/auth';
import { decrypt } from '@/server/encryption';

export async function POST(req) {
  const body = await req.json();

  const { passcode, role, balance, ...data } = body;

  try {
    const { myId } = getUserId();

    const user = await prisma.user.findUnique({
      where: { id: myId },
      select: { passcode: true },
    });

    const payload = await decrypt({ token: user.passcode });

    if (payload.passcode !== passcode) {
      return NextResponse.json({ msg: 'Wrong passcode!' }, { status: 401 });
    }

    const userData = await prisma.user.update({
      where: { id: myId },
      data,
      omit,
    });

    return NextResponse.json({
      userData,
      api_response: 'Your request has been processed successfully!',
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
