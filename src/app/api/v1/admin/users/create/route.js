import { NextResponse } from 'next/server';

import prismaEdge from '@/server/prismaEdge';
import { isAuthorized } from '@/server/auth';
import { getUserId } from '@/server/auth';
import { encrypt } from '@/server/encryption';

export const runtime = 'edge';
export const maxDuration = 30;

const emailErr =
  "The email you're trying to use is associated with another account!";

const phoneErr = 'This phone number has already been taken use another!';

export async function POST(req) {
  try {
    const { myId, error } = await getUserId();

    if (error) return NextResponse.json(error[0], error[1]);

    const body = await req.json();

    const { email, phone } = body;

    const query = prismaEdge.user.findFirst({
      select: { phone: true },
      where: {
        OR: [
          {
            email: {
              equals: email,
              mode: 'insensitive',
            },
          },
          { phone },
        ],
      },
    });

    const params = { query, body, prisma: prismaEdge, myId };

    const { me, error: err, queryResult } = await isAuthorized(params);

    if (err) return NextResponse.json(err[0], err[1]);

    if (queryResult) {
      if (queryResult.phone === phone) {
        return NextResponse.json({ msg: phoneErr }, { status: 400 });
      } else {
        return NextResponse.json({ msg: emailErr }, { status: 400 });
      }
    }

    if (me.role !== 'Admin' && me.role !== 'MODERATOR') {
      return NextResponse.json({ msg: 'Oops! Unauthorized request!!' });
    }

    const passcode = await encrypt({ data: { passcode: '464700' } });

    const user = await prismaEdge.user.create({
      data: {
        ...body,
        passcode,
        balance: 0,
        created_by: myId,
      },
      omit: {
        passcode: true,
      },
    });

    return NextResponse.json({ msg: 'Created Successfully!', user });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}
