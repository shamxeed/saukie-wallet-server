import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { getUserId } from '@/server/middleware/auth';

export async function POST(req) {
  const { myId } = getUserId();

  const body = await req.json();

  const { bonus, is_verified, isBonusPaid, ...data } = body;

  try {
    if (!myId) {
      return NextResponse.json(
        { msg: 'Invalid credentials!' },
        { status: 401 }
      );
    }

    const meta = await prisma.saukieMeta.update({
      where: { user_id: myId },
      data,
    });

    return NextResponse.json({
      meta,
      api_response: 'Your request has been processed successfully!',
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
