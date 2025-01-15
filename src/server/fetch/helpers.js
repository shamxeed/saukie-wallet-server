import { APIs } from '../api';

export const getConfig = (props) => {
  const {
    url,
    fullUrl,
    rawBody,
    provider = 'payscribe',
    token,
    ...rest
  } = props || {};

  let body = JSON.stringify(rawBody);

  const { baseURL, ...res } = APIs?.[provider] || {};

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
    headers: {
      ...res,
      ...headers,
      'Content-Type': 'application/json',
    },
    body,
    ...rest,
  };

  return {
    config,
    url: fullUrl ?? `${baseURL}${url}`,
  };
};

let response;

export const getResponse = async (res, props) => {
  const { provider = 'payscribe' } = props;

  if (res.ok) {
    response = await res.json();
  } else {
    const error = JSON.parse(await res.text());

    const isMonnify = provider === 'monnify';
    const isPayscribe = provider === 'payscribe';

    if (isMonnify) {
      if (error) {
        return error;
      } else {
        return { requestSuccessful: false };
      }
    } else if (isPayscribe) {
      if (error.data) {
        console.log(error.data, 'error from response');
        return error.data;
      } else if (error.description) {
        throw new Error(error?.description);
      }
      console.log(error);
      throw new Error('Something went wrong');
    } else if (error) {
      if (error?.data?.message) {
        throw new Error(error?.data?.message);
      } else if (error?.data?.detail) {
        throw new Error(error?.data?.detail);
      } else if (error?.data?.error) {
        throw new Error(error?.data?.error[0]);
      } else if (error?.error?.[0]) {
        throw new Error(error?.error?.[0]);
      } else {
        throw new Error(error.message);
      }
    }
  }

  return response;
};
