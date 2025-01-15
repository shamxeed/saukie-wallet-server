import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';

export async function GET(req) {
  const email = req.nextUrl.searchParams.get('email');

  const cursor = req.nextUrl.searchParams.get('cursor');

  let data = [];

  let request = {
    where: {
      referred_by: email,
    },
    take: 20,
    orderBy: {
      created_at: 'desc',
    },
  };

  try {
    if (cursor) {
      data = await prisma.saukieMeta.findMany({
        ...request,
        skip: 1,
        cursor: {
          id: cursor,
        },
      });
    } else {
      data = await prisma.saukieMeta.findMany(request);
    }

    const next_cursor = data[19]?.id;

    return NextResponse.json({ data, next_cursor });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}
