import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { hobbyData, myData } from '@/server/helpers';
import { getUserId } from '@/server/auth';

const msg =
  "The email you're trying to use is associated with another account!";

export async function POST(req) {
  try {
    const { myId } = getUserId();

    const { email, isHobby } = await req.json();

    if (!myId) {
      return NextResponse.json(
        { msg: 'Invalid credentials!' },
        { status: 401 }
      );
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
      select: isHobby ? hobbyData : myData,
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
