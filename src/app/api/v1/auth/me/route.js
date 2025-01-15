import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { omit } from '@/server/helpers';
import { getUserId } from '@/server/auth';

export async function GET() {
  const { myId } = getUserId();

  if (!myId) {
    return NextResponse.json({ msg: 'Invalid credentials!' }, { status: 401 });
  }

  try {
    const getMe = prisma.user.findUnique({
      where: { id: myId },
      omit,
    });

    const getConfig = prisma.config.findUnique({
      where: { id: 'config' },
    });

    const [me, config] = await prisma.$transaction([getMe, getConfig]);

    return NextResponse.json({ config, me });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
