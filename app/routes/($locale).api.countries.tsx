import {json} from '@vercel/remix';

import {CACHE_LONG} from '~/data/cache';
import {countries} from '~/data/countries';

export const config = {
  runtime: 'edge',
};

export async function loader() {
  return json(
    {
      ...countries,
    },
    {
      headers: {
        'cache-control': CACHE_LONG,
      },
    },
  );
}

// no-op
export default function CountriesApiRoute() {
  return null;
}
