import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import prisma from '@/server/prisma';

const api_response =
  'Your request to delete your account has been received successfully and will be deleted in the next 30 days.';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findFirst({
      where: { email },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { msg: 'Invalid details provided!' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { msg: 'Invalid details provided!' },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: {
        role: 'DELETED',
      },
    });

    return NextResponse.json({
      api_response,
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
