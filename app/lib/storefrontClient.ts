import {createStorefrontClient} from '@shopify/hydrogen';

import {getLocaleFromRequest} from './utils';

export const storeDomain = 'https://' + (process.env.PUBLIC_STORE_DOMAIN ?? '');

export const getStorefrontClient = (request: Request) => {
  return createStorefrontClient({
    i18n: getLocaleFromRequest(request),
    publicStorefrontToken: process.env.PUBLIC_STOREFRONT_API_TOKEN,
    privateStorefrontToken: process.env.PRIVATE_STOREFRONT_API_TOKEN,
    storeDomain,
    storefrontApiVersion: '2023-04',
    storefrontId: process.env.PUBLIC_STOREFRONT_ID,
    storefrontHeaders: {
      requestGroupId: null,
      buyerIp: null,
      cookie: request.headers.get('cookie'),
    },
  }).storefront;
};
