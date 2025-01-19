import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { omit } from '@/server/helpers';
import { getUserId } from '@/server/auth';

export async function POST(req) {
  const body = await req.json();

  const { passcode, role, balance, ...data } = body;

  try {
    const { myId, error } = await getUserId();

    if (error) {
      return NextResponse.json(error[0], error[1]);
    }

    const userData = await prisma.user.update({
      where: { id: myId },
      data,
      omit,
    });

    return NextResponse.json({
      userData,
      api_response: 'Your request has been processed successfully!',
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
