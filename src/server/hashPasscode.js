import bcrypt from 'bcryptjs';

export const hashPasscode = (passcode) => {
  if (passcode?.trim().length < 6) throw new Error('Passcode is too short!');
  if (passcode?.trim().length > 6) throw new Error('Passcode is too long!');

  return bcrypt.hash(passcode, 10);
};
