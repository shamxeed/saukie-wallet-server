import { NextResponse } from 'next/server';

import prisma from '@/server/prisma';
import { getUserId } from '@/server/auth';

export async function GET() {
  const { myId } = getUserId();

  try {
    if (!myId) {
      return NextResponse.json(
        { msg: 'Oops! Unauthorized request!' },
        { status: 401 }
      );
    }

    const config = await prisma.config.findUnique({
      where: { id: 'config' },
      omit: {
        id: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ config });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}
