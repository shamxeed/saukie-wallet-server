import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { omit } from '@/server/helpers';
import { decrypt, signJWT } from '@/server/encryption';

export async function POST(req) {
  try {
    const { phone, passcode } = await req.json();

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      return NextResponse.json(
        { msg: 'Invalid login credentials!' },
        { status: 401 }
      );
    }

    if (user.role === 'DELETED') {
      return NextResponse.json(
        {
          msg: "Oops!! You can't access your account as you requested it to be deleted!! If you want to restore it please send us mail at support@saukie.net.",
        },
        { status: 401 }
      );
    }

    if (user.role === 'BLOCKED') {
      return NextResponse.json(
        {
          msg: 'You are blocked from using our services!! Send us mail at support@saukie.net for assisstance!!',
        },
        { status: 401 }
      );
    }

    const payload = await decrypt({ token: user.passcode });

    if (payload.passcode !== passcode) {
      return NextResponse.json(
        { msg: 'Invalid login cridentials!' },
        { status: 401 }
      );
    }

    const updateMe = prisma.user.findUnique({
      omit,
      where: { phone },
    });

    const getConfig = prisma.config.findUnique({
      where: { id: 'config' },
    });

    const [me, config] = await prisma.$transaction([updateMe, getConfig]);

    const token = await signJWT({ data: { userId: me.id } });

    return NextResponse.json({ token, config, user });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
