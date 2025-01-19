import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import prismaEdge from '@/server/prismaEdge';
import { isAdmin } from '@/server/auth/isAdmin';
import { getUserId } from '@/server/auth';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { myId, error } = await getUserId();

    if (error) {
      return NextResponse.json(error[0], error[1]);
    }

    const body = await req.json();

    const { accountId, amount: the_amount } = body;

    if (!body.accountId) {
      return NextResponse.json({ msg: 'Bad request!' }, { status: 400 });
    }

    const query = prismaEdge.user.findUnique({
      select: { id: true },
      where: { id: Number(accountId) },
    });

    const params = { query, body, prisma: prismaEdge, isUser: true, myId };

    const isAdminResponse = await isAdmin(params);

    if (isAdminResponse.error) {
      const { error } = isAdminResponse;
      return NextResponse.json(error[0], error[1]);
    }

    const amount = new Prisma.Decimal(the_amount);

    const note = `Cash Deposit was made to your account by cashier ${myId}`;

    const fundUserData = {
      balance: { increment: amount },
      transactions: {
        create: {
          note,
          amount,
          type: 'credit',
          cashier_id: myId,
          status: 'success',
          service: 'deposit',
          channel: 'Cash Deposit',
        },
      },
    };

    const data /* { transactions } */ = await prismaEdge.user.update({
      data: fundUserData,
      select: { id: true },
      where: { id: Number(accountId) },
      /* select: {
          transactions: {
            take: 1,
            orderBy: {
              created_at: 'desc',
            },
          },
        }, */
    });

    return NextResponse.json({ data, msg: 'Deposited Successfully!' });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}
