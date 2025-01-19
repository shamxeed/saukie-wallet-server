import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { omit } from '@/server/helpers';
import { getUserId } from '@/server/auth';

const msg =
  "The email you're trying to use is associated with another account!";

export async function POST(req) {
  try {
    const { email } = await req.json();

    const { myId, error } = await getUserId();

    if (error) {
      return NextResponse.json(error[0], error[1]);
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });

    if (user) {
      return NextResponse.json({ msg }, { status: 401 });
    }

    const userData = await prisma.user.update({
      where: { id: myId },
      data: {
        email,
        is_email_verified: false,
      },
      omit,
    });

    return NextResponse.json({
      userData,
      api_response: 'Your email has been changed successfully!',
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
