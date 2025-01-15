import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import prisma from '@/server/prisma';
import { hashPassword } from '@/server/hashPassword';
import { hobbyData, myData } from '@/server/helpers';

export async function POST(request) {
  const body = await request.json();

  const { email, new_password, old_password, isHobby } = body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        password: true,
      },
    });

    const isMatch = await bcrypt.compare(old_password, user.password);

    if (!isMatch) {
      return NextResponse.json({ msg: 'Wrong Password!' }, { status: 401 });
    }

    const password = await hashPassword(new_password);

    const userData = await prisma.user.update({
      where: { email },
      data: {
        password,
      },
      select: isHobby ? hobbyData : myData,
    });

    return NextResponse.json({
      userData,
      api_response: "You've successfully updated your password.",
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
