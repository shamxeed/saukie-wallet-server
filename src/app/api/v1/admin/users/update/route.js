import { NextResponse } from 'next/server';

import { omit } from '@/server/helpers';
import prismaEdge from '@/server/prismaEdge';
import { getUserId, isAuthorized } from '@/server/auth';

export async function POST(req) {
  const body = await req.json();

  const { accountId, passcode, role, balance, ...data } = body;

  try {
    const { myId, error } = await getUserId();

    if (error) return NextResponse.json(error[0], error[1]);

    const query = prismaEdge.user.findUnique({
      select: { id: true },
      where: { id: Number(accountId) },
    });

    const params = { query, body, prisma: prismaEdge, myId, isUser: true };

    const { me, error: err } = await isAuthorized(params);

    if (err) return NextResponse.json(err[0], err[1]);

    if (me.role !== 'Admin' && me.role !== 'MODERATOR') {
      return NextResponse.json({ msg: 'Oops! Unauthorized request!!' });
    }

    const user = await prismaEdge.user.update({
      data: {
        ...data,
        updated_by: myId,
      },
      omit,
      where: { id: Number(accountId) },
    });

    return NextResponse.json({
      user,
      msg: 'Your request has been processed successfully!',
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
