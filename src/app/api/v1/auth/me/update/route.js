import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { myData } from '@/server/helpers';
import { getUserId } from '@/server/middleware/auth';

export async function POST(req) {
  const { myId } = getUserId();

  const body = await req.json();

  const { password, role, balance, ...data } = body;

  try {
    if (!myId) {
      return NextResponse.json(
        { msg: 'Invalid credentials!' },
        { status: 401 }
      );
    }

    const userData = await prisma.user.update({
      where: { id: myId },
      data,
      select: myData,
    });

    return NextResponse.json({
      userData: { ...userData, ...userData.meta },
      api_response: 'Your request has been processed successfully!',
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
