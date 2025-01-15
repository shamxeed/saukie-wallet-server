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
  name: true,
  phone: true,
  balance: true,
  is_email_verified: true,
  role: true,
};

export const omit = {
  passcode: true,
  referred_by: true,
  updated_at: true,
  is_verified: true,
};

export const calc_discount = ({ role, bundles = [] }) => {
  const isReseller = role === 'Reseller';

  bundles.forEach((i) => {
    const discount_rate = isReseller ? i.reseller_discount : i.api_discount;

    i.title = i.title?.replace(i.amount, i.amount - discount_rate);

    i.amount = i.amount - discount_rate;
  });
};
