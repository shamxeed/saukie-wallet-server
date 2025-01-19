import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { omit } from '@/server/helpers';
import { getUserId } from '@/server/auth';

export async function GET() {
  try {
    const { myId, error } = await getUserId();

    if (error) {
      return NextResponse.json(error[0], error[1]);
    }

    const getMe = prisma.user.findUnique({
      omit,
      where: { id: myId },
    });

    const getConfig = prisma.config.findUnique({
      where: { id: 'config' },
    });

    const getTransactions = prisma.transaction.findMany({
      take: 5,
      where: { user_id: myId },
      orderBy: { created_at: 'desc' },
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
