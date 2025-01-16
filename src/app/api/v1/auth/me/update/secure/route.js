import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { omit } from '@/server/helpers';
import { getUserId } from '@/server/auth';

export async function POST(req) {
  const { myId } = getUserId();

  const body = await req.json();

  const { passcode, role, balance, ...data } = body;

  try {
    if (!myId) {
      return NextResponse.json(
        { msg: 'Oops! Unauthorized request!!' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: myId },
      select: { passcode: true },
    });

    const isMatch = await bcrypt.compare(passcode, user.passcode);

    if (!isMatch) {
      return NextResponse.json(
        { msg: 'Invalid login cridentials!' },
        { status: 401 }
      );
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
