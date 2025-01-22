import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { encrypt } from '@/server/encryption';
import { getUserId, isAdmin } from '@/server/auth';

export async function POST(request) {
  try {
    const { myId, error } = await getUserId();

    if (error) return NextResponse.json(error[0], error[1]);

    const body = await request.json();

    const query = prisma.user.findFirst({
      select: { id: true },
      where: { id: Number(body.accountId) },
    });

    const authOptions = { body, prisma, query, myId, isUser: true };

    const { error: err } = await isAdmin(authOptions);

    if (err) return NextResponse.json(err[0], err[1]);

    const passcode = await encrypt({ data: { passcode: '464700' } });

    const { name } = await prisma.user.update({
      data: { passcode },
      select: { name: true },
      where: { id: Number(body.accountId) },
    });

    return NextResponse.json({
      api_response: `You've successfully reset passcode for ${name}.`,
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
