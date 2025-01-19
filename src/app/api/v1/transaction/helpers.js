export const getType = (req) => {
  const type = req.nextUrl.searchParams.get('type');

  if (type === 'all') {
    return '';
  } else return type;
};

export const getWhere = (req, myId) => {
  const type = getType(req);

  let where = { user_id: myId };

  if (type) {
    where = {
      type,
      user_id: myId,
    };
  }

  return where;
};

export const getRequest = (req, myId) => {
  let where = getWhere(req, myId);

  let request = {
    where,
    take: 30,
    orderBy: {
      created_at: 'desc',
    },
  };

  return request;
};
