import { headers } from 'next/headers';

import { verifyJWT } from '../encryption';

let error = [{ msg: 'Oops! Unauthorized request!!' }, { status: 401 }];

export const getUserId = async () => {
  const _headers = await headers();

  const token = _headers.get('x-auth-token');

  if (!token) return { error };

  try {
    const payload = await verifyJWT({ token });

    const myId = payload.userId;

    if (!myId) return { error };

    return { myId };
  } catch (err) {
    console.log('getUserId, jwt', err.message);
    return { error: [{ msg: 'Session Expired!' }, { status: 401 }] };
  }
};
