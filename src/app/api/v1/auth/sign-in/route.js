import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

import prisma from '@/server/prisma';
import { myData } from '@/server/helpers';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { msg: 'Invalid login cridentials!' },
        { status: 401 }
      );
    }

    const device_id = nanoid();

    const updateMe = prisma.user.update({
      data: { device_id },
      where: { email: user.email },
      select: myData,
    });

    const getConfig = prisma.config.findUnique({
      where: { id: 'config' },
    });

    const [me, config] = await prisma.$transaction([updateMe, getConfig]);

    const SECRET_KEY = process.env.SECRET_KEY;

    const token = jwt.sign({ userId: me.id }, SECRET_KEY);

    me.device_id = device_id;

    delete me.meta.id;

    return NextResponse.json({
      token,
      config,
      user,
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
