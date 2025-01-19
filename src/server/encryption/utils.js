import * as jose from 'jose';

const key = process.env.SECRET_KEY;
const secret = jose.base64url.decode(key);

export const generateSecret = async (enc = 'A128CBC-HS256') => {
  return await jose.generateSecret(enc);
};

export const encrypt = async ({ enc = 'A128CBC-HS256', data }) => {
  const encrypted = await new jose.EncryptJWT(data)
    .setProtectedHeader({ alg: 'dir', enc })
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    .encrypt(secret);

  return encrypted;
};

export const decrypt = async ({ token }) => {
  const { payload } = await jose.jwtDecrypt(token, secret, {
    issuer: 'urn:example:issuer',
    audience: 'urn:example:audience',
  });

  return payload;
};

export const signJWT = async ({ alg = 'HS256', data }) => {
  const jwt = await new jose.SignJWT(data)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    // .setExpirationTime('2h')
    .sign(secret);

  return jwt;
};

export const verifyJWT = async ({ token }) => {
  //const secret = new TextEncoder().encode(key);

  const { payload } = await jose.jwtVerify(token, secret, {
    issuer: 'urn:example:issuer',
    audience: 'urn:example:audience',
  });

  return payload;
};
