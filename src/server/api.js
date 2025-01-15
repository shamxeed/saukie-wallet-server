export const APIs = {
  jonet: {
    Authorization: process.env.JONET_API_KEY,
    baseURL: 'https://jonet.com.ng/api_live/v1',
  },
  alrahuz: {
    baseURL: 'https://alrahuzdata.com.ng/api',
    Authorization: `Token  ${process.env.ALRAHUZDATA}`,
  },
  dancity: {
    baseURL: 'https://dancitysub.com/api',
    Authorization: `Token ${process.env.DANCITY}`,
  },
  dancity_2: {
    baseURL: 'https://dancitysub.com/api',
    Authorization: `Token ${process.env.DANCITY}`,
  },
  coolsub: {
    baseURL: 'https://cool-sub.com/api',
    Authorization: `Token ${process.env.COOLSUB}`,
  },
  datastation: {
    baseURL: 'https://datastation.com.ng/api',
    Authorization: `Token ${process.env.DATASTATION_APIKEY}`,
  },
  dataplus: {
    baseURL: 'https://dataplus.ng/api',
    Authorization: `Token ${process.env.DATAPLUS}`,
  },
  kvdata: {
    baseURL: 'https://kvdata.net/api',
    Authorization: `Token ${process.env.KVDATA}`,
  },
  kvdataapi: {
    baseURL: 'https://kvdataapi.net/api',
    Authorization: `Token ${process.env.KVDATAAPI}`,
  },
  payscribe: {
    baseURL: 'https://api.payscribe.ng/api/v1',
    Authorization: `Bearer ${process.env.PAYSCRIBE}`,
  },
  vpay: {
    baseURL: 'https://services2.vpay.africa',
    publicKey: 'ab28ff42-a9e9-431a-9187-860d428c45f8',
  },
  monnify: {
    baseURL: 'https://api.monnify.com',
    Authorization: `Basic ${process.env.MONNIFY_API_KEY}`,
  },
  payvessel: {
    baseURL: 'https://api.payvessel.com',
    'api-key': `${process.env.PAYVESSEL_API_KEY}`,
    'api-secret': `Bearer ${process.env.PAYVESSEL_API_SECRET}`,
  },
  paymentpoint: {
    baseURL: 'https://api.paymentpoint.co',
    'api-key': `${process.env.PAYMENTPOINT_API_KEY}`,
    Authorization: `Bearer ${process.env.PAYMENTPOINT_API_SECRET}`,
  },
  geoNames: {
    baseURL: 'http://api.geonames.org/countryCodeJSON',
  },
  apiip: {
    baseURL: 'https://apiip.net/api/check',
  },
};
