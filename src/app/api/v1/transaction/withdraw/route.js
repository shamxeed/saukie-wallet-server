import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import prismaEdge from '@/server/prismaEdge';
import { getUserId, isAuthorized } from '@/server/auth';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { myId, error } = await getUserId();

    if (error) return NextResponse.json(error[0], error[1]);

    const body = await req.json();

    const query = prismaEdge.user.findUnique({
      select: { id: true },
      where: { id: myId },
    });

    const params = { query, body, prisma: prismaEdge, myId };

    const { error: err, me } = await isAuthorized(params);

    if (err) return NextResponse.json(err[0], err[1]);

    if (Number(body.amount) < 1 || Number(body.amount) > me.balance) {
      await prismaEdge.user.update({
        where: { id: myId },
        role: 'BLOCKED',
      });

      return NextResponse.json(err[0], err[1]);
    }

    const amount = new Prisma.Decimal(body.amount);

    const note = `Withdrawal request received. Transaction is in progress.`;

    const fundUserData = {
      balance: { decrement: amount },
      transactions: {
        create: {
          note,
          amount,
          type: 'debit',
          status: 'processing',
          service: 'withdrawal',
          channel: 'Bank Withdrawal',
        },
      },
    };

    const data = await prismaEdge.user.update({
      data: fundUserData,
      select: { id: true },
      where: { id: myId },
      select: {
        transactions: {
          take: 1,
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    const transaction = data?.transactions?.[0];

    return NextResponse.json({ transaction, msg: 'Transaction in progress!' });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}
