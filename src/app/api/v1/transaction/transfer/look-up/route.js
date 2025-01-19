import { NextResponse } from 'next/server';

import prismaEdge from '@/server/prismaEdge';

export const runtime = 'edge';
export const maxDuration = 30;

export async function GET(req) {
  try {
    const accountNumber = req.nextUrl.searchParams.get('accountNumber');

    const user = await prismaEdge.user.findUnique({
      where: { phone: accountNumber },
      select: { name: true },
    });

    if (!user) {
      return NextResponse.json({ msg: 'No Account Found!' }, { status: 400 });
    }

    return NextResponse.json({ data: user });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}
