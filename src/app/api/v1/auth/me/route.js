import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

import prisma from '@/server/prisma';
import { calc_discount, myData } from '@/server/helpers';
import { getUserId } from '@/server/middleware/auth';
import { getBundle } from '@/server/utils/bundle';

export async function GET() {
  const { myId } = getUserId();

  if (!myId) {
    return NextResponse.json({ msg: 'Invalid credentials!' }, { status: 401 });
  }

  const device_id = nanoid();

  try {
    const getMe = prisma.user.update({
      where: { id: myId },
      data: { device_id },
      select: myData,
    });

    const getConfig = prisma.config.findUnique({
      where: { id: 'config' },
    });

    const [me, bundles, config] = await prisma.$transaction([
      getMe,
      getBundle(prisma),
      getConfig,
    ]);

    const discount = ['Reseller', 'API'];

    const { role } = me;

    if (discount.includes(role)) {
      calc_discount({ role, bundles });
    }

    delete me.meta.id;

    return NextResponse.json({
      bundles,
      config,
      me: { ...me, ...me.meta },
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error!' }, { status: 500 });
  }
}
