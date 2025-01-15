import { endpoint } from '@/constants/endpoint';

export const calc_user_balance = (user, amount, isFunding) => {
  const { balance, amount_spent, total_funding } = user;

  const _amount = Number(amount);

  const new_balance = isFunding ? balance + _amount : balance - _amount;

  const new_total_funding = total_funding + _amount;

  const new_amount_spent = amount_spent + _amount;

  return {
    balance,
    new_balance,
    new_amount_spent,
    new_total_funding,
  };
};

export const myData = {
  id: true,
  email: true,
  phone: true,
  balance: true,
  transaction_pin: true,
  is_email_verified: true,
  data_transactions_count: true,
  airtime_transactions_count: true,
  amount_spent: true,
  total_funding: true,
  role: true,
  device_id: true,
  meta: true,
};

export const hobbyData = {
  id: true,
  role: true,
  email: true,
  metadata: true,
  is_email_verified: true,
};

export const hobbyConfig = {
  phone: true,
  support_mail: true,
  hobby_app_version: true,
};

export const checkStatus = (status) => {
  const response = {
    transactionFailed: false,
  };

  if (
    !status ||
    status?.toLowerCase() === 'failed' ||
    status?.toLowerCase()?.includes('invalid')
  ) {
    return { transactionFailed: true };
  }

  return response;
};

const deduct_and_createTxt = async (miliSecs, props) => {
  const {
    plan,
    myId,
    amount,
    prisma,
    status,
    balance,
    network,
    service,
    new_balance,
    new_amount_spent,
    api_response = '',
    mobile_number,
  } = props || {};

  setTimeout(async () => {
    await prisma.user.update({
      where: { id: myId },
      data: {
        balance: new_balance,
        amount_spent: new_amount_spent,
        data_transactions_count: {
          increment: 1,
        },
        transactions: {
          create: {
            plan,
            amount,
            status,
            service,
            api_response,
            type: 'purchase',
            provider: network,
            balance_before: balance,
            new_balance: new_balance,
            mobile_number: mobile_number,
          },
        },
      },
    });
  }, miliSecs);
};

export const retry = async (props) => {
  try {
    await deduct_and_createTxt(5000, props);
  } catch (err) {
    deduct_and_createTxt(10000, props);
  }
};

export const calc_discount = ({ role, bundles = [] }) => {
  const isReseller = role === 'Reseller';

  bundles.forEach((i) => {
    const discount_rate = isReseller ? i.reseller_discount : i.api_discount;

    i.title = i.title?.replace(i.amount, i.amount - discount_rate);

    i.amount = i.amount - discount_rate;
  });
};

export const calc_amount = ({ user, plan }) => {
  const { role } = user;

  const { amount, api_discount, reseller_discount } = plan;

  const is_dicounted = ['API', 'Reseller'].includes(role);

  let rate = amount;

  if (is_dicounted) {
    const isReseller = role === 'Reseller';
    rate = isReseller ? amount - reseller_discount : amount - api_discount;
  }

  return {
    amount: rate,
  };
};

export const refund = (data, _url = '/transaction/refund') => {
  const url = endpoint + _url;

  fetch({
    url,
    method: 'post',
    body: JSON.stringify({ transaction: data }),
  });
};
