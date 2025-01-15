import fetch from '@/server/fetch';

const contractCode = process.env.MONNIFY_CONTRACT_CODE;

export const getAccount = async (token, email) => {
  return await fetch({
    token,
    method: 'get',
    provider: 'monnify',
    url: `/api/v2/bank-transfer/reserved-accounts/${email}`,
  });
};

export const reserveAccount = async (token, nin, name, email) => {
  return await fetch({
    token,
    provider: 'monnify',
    url: `/api/v2/bank-transfer/reserved-accounts`,
    rawBody: {
      nin,
      contractCode,
      accountName: name,
      customerName: name,
      currencyCode: 'NGN',
      customerEmail: email,
      accountReference: email,
      getAllAvailableBanks: false,
      preferredBanks: ['035', '50515'],
    },
  });
};

export const verifyNIN = async (token, nin, email) => {
  return await fetch({
    token,
    method: 'put',
    rawBody: { nin },
    provider: 'monnify',
    url: `/api/v1/bank-transfer/reserved-accounts/${email}/kyc-info`,
  });
};

export const updateUser = async (prismaEdge, response, nin, user_id) => {
  const { responseBody } = response;

  const { accountName } = responseBody;

  const [lastName, first_name, middle_name] = accountName.split(' ');

  const last_name = middle_name ? `${lastName} ${middle_name}` : lastName;

  return await prismaEdge.saukieMeta.update({
    where: { user_id },
    data: {
      nin,
      first_name,
      last_name,
      is_nin_verified: true,
    },
  });
};
