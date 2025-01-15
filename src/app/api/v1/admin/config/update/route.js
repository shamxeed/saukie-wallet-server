import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';

export async function POST(req) {
  const body = await req.json();

  try {
    const config = await prisma.config.upsert({
      where: { id: 'config' },
      update: body,
      create: body,
    });

    return NextResponse.json({ config });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
