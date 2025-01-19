export { getUserId } from './userId';
export { isAdmin } from './isAdmin';

export const authorization = async (prisma, body, query) => {
  const { amount, pin, amountToPay } = body;

  const { myId } = getUserId();

  const response = {
    myId,
    error: true,
    statusCode: 400,
    msg: 'Insufficient balance!',
  };

  if (!myId) {
    return {
      ...response,
      statusCode: 401,
      msg: 'Unauthorized request!',
    };
  }

  if (amount && amount < 1) {
    await prismaEdge.user.update({
      where: { id: myId },
      data: {
        role: 'BLOCKED',
      },
    });

    return response;
  }

  const getUser = prisma.user.findUnique({
    where: { id: myId },
    select: {
      balance: true,
      amount_spent: true,
      transaction_pin: true,
    },
  });

  const options = [getUser];

  if (query) {
    options.push(query);
  }

  const [user, queryData] = await prisma.$transaction(options);

  const { transaction_pin, balance, role } = user;

  if (role === 'BLOCKED' || role === 'DELETED') {
    return {
      ...response,
      statusCode: 401,
      msg: 'You are not allowed to perform this transaction! Send us mail at support@saukie.net for assistance!',
    };
  }

  if (pin !== transaction_pin) {
    return {
      ...response,
      statusCode: 401,
      msg: 'Incorrect transaction pin!',
    };
  }

  if (amountToPay) {
    if (amountToPay > balance) return response;
  } else if (amount) {
    if (amount > balance) return response;
  }

  return {
    ...response,
    queryData,
    user,
    myId,
    error: false,
  };
};
