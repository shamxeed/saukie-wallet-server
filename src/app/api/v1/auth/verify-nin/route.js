import { NextResponse } from 'next/server';

import fetch from '@/server/fetch';
import prismaEdge from '@/server/prismaEdge';
import { getAccount, reserveAccount, updateUser, verifyNIN } from './helpers';

export const runtime = 'edge';
export const maxDuration = 30;

const logMeIn = async () => {
  return await fetch({
    provider: 'monnify',
    url: '/api/v1/auth/login',
  });
};

let response;

export async function POST(req) {
  const body = await req.json();

  const { email, nin, meta } = body;

  const { first_name, last_name, user_id } = meta;

  const name = `${first_name} ${last_name}`;

  if (nin?.trim()?.length <= 10) {
    return NextResponse.json({ msg: 'Invalid NIN provided!' }, { status: 500 });
  }

  try {
    const user = await prismaEdge.saukieMeta.findUnique({
      where: { nin },
      select: { id: true },
    });

    if (user) {
      return NextResponse.json(
        { msg: 'A user with this NIN already exists!' },
        { status: 500 }
      );
    }

    const authRes = await logMeIn();

    if (!authRes.requestSuccessful) {
      return NextResponse.json({ msg: 'Auth Error!' }, { status: 500 });
    }

    const { accessToken } = authRes.responseBody;

    //CHECK WHETHER ACCOUNT ALREADY EXIST//////
    response = await getAccount(accessToken, email);

    const { requestSuccessful, responseMessage } = response || {};

    //RESERVE ACCOUNT IF NOT ALREADY EXIST//////
    if (responseMessage === 'Cannot find reserved account') {
      response = await reserveAccount(accessToken, nin, name, email);
    }

    console.log(response);

    if (!requestSuccessful) {
      return NextResponse.json({ msg: responseMessage }, { status: 400 });
    }

    //~~~~~~~~~~~VERIFY NIN~~~~~~~~~~~~~//////
    response = await verifyNIN(accessToken, nin, email);

    if (!requestSuccessful) {
      return NextResponse.json({ msg: responseMessage }, { status: 400 });
    }

    //~~~~~~~~~~~FINALLY UPDATE USER~~~~~~~~~~~~~//////
    const userData = await updateUser(prismaEdge, response, nin, user_id);

    return NextResponse.json({
      userData: { meta: userData },
      api_response: 'Your NIN verification is Successful!',
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}
