import Axios from 'axios';
import { APIs } from './utils/api';

export const axios = async (props) => {
  const { url, rawBody, provider = 'payscribe', token, ...rest } = props || {};

  let body = JSON.stringify(rawBody);

  const { baseURL, ...res } = APIs[provider];

  const isMonnify = provider === 'monnify';

  const headers =
    token && !isMonnify
      ? {
          'b-access-token': token,
        }
      : {};

  if (token && isMonnify) {
    res.Authorization = `Bearer ${token}`;
  }

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${baseURL}${url}`,
    headers: {
      ...res,
      ...headers,
      'Content-Type': 'application/json',
    },
    data: body,
    ...rest,
  };

  try {
    const response = await Axios.request(config);

    return response;
  } catch (err) {
    const isPayscribe = provider === 'payscribe';

    console.log(err.message);
    if (isMonnify) {
      if (err.response?.data) {
        return err.response;
      } else {
        return { data: { requestSuccessful: false } };
      }
    } else if (isPayscribe) {
      throw new Error(err.response.data.message.description);
    } else if (err.response) {
      if (err.response?.data?.message) {
        throw new Error(err.response?.data?.message);
      } else if (err.response?.data?.detail) {
        throw new Error(err.response?.data?.detail);
      } else if (err.response?.data?.error) {
        throw new Error(err?.response?.data?.error[0]);
      }
    } else if (err.request) {
      if (err?.message?.includes('Network')) {
        throw new Error(err.message);
      }
      throw new Error(err.request._response);
    } else {
      throw new Error('Oops! Something went wrong!');
    }
  }
};
