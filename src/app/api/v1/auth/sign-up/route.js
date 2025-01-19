import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { encrypt, signJWT } from '@/server/encryption';

const emailErr =
  "The email you're trying to use is associated with another account!";

const phoneErr = 'This phone number has already been taken use another!';

export async function POST(req) {
  const body = await req.json();

  const { email, phone, passcode: pass } = body;

  try {
    const lookup = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: email,
              mode: 'insensitive',
            },
          },
          {
            phone,
          },
        ],
      },
      select: {
        email: true,
      },
    });

    if (lookup) {
      if (lookup.email === email) {
        return NextResponse.json({ msg: emailErr }, { status: 400 });
      } else {
        return NextResponse.json({ msg: phoneErr }, { status: 400 });
      }
    }

    const passcode = await encrypt({ data: { passcode: pass } });

    const createUser = prisma.user.create({
      data: {
        ...body,
        passcode,
        balance: 0,
      },
      omit: {
        passcode: true,
      },
    });

    const getConfig = prisma.config.findUnique({
      where: { id: 'config' },
    });

    const [user, config] = await prisma.$transaction([createUser, getConfig]);

    const token = await signJWT({ data: { userId: user?.id } });

    return NextResponse.json({ token, config, user });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
