import { NextResponse } from 'next/server';

import { getUserId } from '@/server/auth';
import { getRequest, getWhere } from './helpers';
import prismaEdge from '@/server/prismaEdge';

export const runtime = 'edge';
export const maxDuration = 30;

let get_data;

export async function GET(req) {
  const cursor = req.nextUrl.searchParams.get('cursor');

  try {
    const { myId, error } = await getUserId();

    if (error) {
      return NextResponse.json(error[0], error[1]);
    }

    let where = getWhere(req, myId);
    let request = getRequest(req, myId);

    if (cursor) {
      get_data = prismaEdge.transaction.findMany({
        ...request,
        skip: 1,
        cursor: {
          id: Number(cursor),
        },
      });
    } else {
      get_data = prismaEdge.transaction.findMany(request);
    }

    const queries = [get_data];

    const get_count = prismaEdge.transaction.count({ where });

    if (!cursor) queries.push(get_count);

    const [data, count] = await prismaEdge.$transaction(queries);

    const next_cursor = data[49]?.id;

    return NextResponse.json({ data, count, next_cursor });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}
