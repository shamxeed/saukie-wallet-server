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

    const getTransactions = prisma.transaction.findMany({
      where: { user_id: myId },
      orderBy: {
        created_at: 'desc',
      },
      take: 5,
    });

    const [me, config, transactions] = await prisma.$transaction([
      getMe,
      getConfig,
      getTransactions,
    ]);

    return NextResponse.json({ me, config, transactions });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
