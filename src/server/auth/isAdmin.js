import { decrypt } from '@/server/encryption';

let error = [{ msg: 'Oops! Unauthorized request!!' }, { status: 401 }];

export const isAdmin = async (data) => {
  const { prisma, myId, body, query, isUser, select = {} } = data;

  const getMe = prisma.user.findUnique({
    where: { id: myId },
    select: {
      role: true,
      passcode: true,
      ...select,
    },
  });

  const queries = [getMe];

  if (query) queries.push(query);

  const [me, queryResult] = await prisma.$transaction(queries);

  if (me?.role !== 'Admin') return { error };

  const payload = await decrypt({ token: me.passcode });

  if (payload.passcode !== body.passcode) {
    return { error: [{ msg: 'Wrong Passcode!' }, { status: 401 }] };
  }

  if (isUser && !queryResult) {
    return { error: [{ msg: 'No Account Found!' }, { status: 400 }] };
  }

  return { me, queryResult };
};
