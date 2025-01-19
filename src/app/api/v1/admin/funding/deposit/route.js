import { NextResponse } from 'next/server';

import prismaEdge from '@/server/prismaEdge';
import { isAdmin } from '@/server/auth/isAdmin';
import { getUserId } from '@/server/auth';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req) {
  try {
    const body = await req.json();

    const { myId, error } = await getUserId();

    if (error) {
      return NextResponse.json(error[0], error[1]);
    }

    if (!body.account) {
      return NextResponse.json({ msg: 'Bad request!' }, { status: 400 });
    }

    const query = prismaEdge.user.findUnique({
      select: { id: true },
      where: { phone: body.account },
    });

    const params = { query, body, prisma: prismaEdge, isUser: true, myId };

    const isAdminResponse = await isAdmin(params);

    if (isAdminResponse.error) {
      const { error } = isAdminResponse;
      return NextResponse.json(error[0], error[1]);
    }

    return NextResponse.json(isAdminResponse);
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}
