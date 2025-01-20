import { decrypt } from '@/server/encryption';

let error = [{ msg: 'Oops! Unauthorized request!!' }, { status: 401 }];

export const isAuthorized = async (parmas) => {
  const { prisma, body, query, myId } = parmas;

  const getUser = prisma.user.findUnique({
    where: { id: myId },
    select: {
      role: true,
      balance: true,
      passcode: true,
    },
  });

  const queries = [getUser];

  if (query) queries.push(query);

  const [me, queryResult] = await prisma.$transaction(queries);

  if (me.role === 'BLOCKED' || me.role === 'DELETED') {
    return { error };
  }

  const payload = await decrypt({ token: me.passcode });

  if (payload.passcode !== body.passcode) {
    return { error: [{ msg: 'Wrong Passcode!' }, { status: 401 }] };
  }

  return { queryResult, me };
};
