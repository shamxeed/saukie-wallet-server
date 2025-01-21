import { NextResponse } from 'next/server';

import { omit } from '@/server/helpers';
import { getUserId } from '@/server/auth';
import prismaEdge from '@/server/prismaEdge';

export const runtime = 'edge';
export const maxDuration = 30;

export async function GET() {
  try {
    const { myId, error } = await getUserId();

    if (error) {
      return NextResponse.json(error[0], error[1]);
    }

    const getMe = prismaEdge.user.findUnique({
      omit,
      where: { id: myId },
    });

    const getConfig = prismaEdge.config.findUnique({
      where: { id: 'config' },
    });

    const getTransactions = prismaEdge.transaction.findMany({
      take: 10,
      where: { user_id: myId },
      orderBy: { created_at: 'desc' },
    });

    const [me, config, transactions] = await prismaEdge.$transaction([
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
