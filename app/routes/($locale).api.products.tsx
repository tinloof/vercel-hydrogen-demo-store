import {json, type LoaderArgs} from '@vercel/remix';
import {flattenConnection} from '@shopify/hydrogen';
import type {ProductConnection} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';

import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getStorefrontClient} from '~/lib/storefrontClient';

export const config = {
  runtime: 'edge',
};

/**
 * Fetch a given set of products from the storefront API
 * @param count
 * @param query
 * @param reverse
 * @param sortKey
 * @returns Product[]
 * @see https://shopify.dev/api/storefront/2023-04/queries/products
 */
export async function loader({request}: LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const storefrontClient = getStorefrontClient(request);

  const sortKey = searchParams.get('sortKey') ?? 'BEST_SELLING';
  const query = searchParams.get('query') ?? '';

  let reverse = false;
  try {
    const _reverse = searchParams.get('reverse');
    if (_reverse === 'true') {
      reverse = true;
    }
  } catch (_) {
    // noop
  }

  let count = 4;
  try {
    const _count = searchParams.get('count');
    if (typeof _count === 'string') {
      count = parseInt(_count);
    }
  } catch (_) {
    // noop
  }

  const {products} = await storefrontClient.query<{
    products: ProductConnection;
  }>(PRODUCTS_QUERY, {
    variables: {
      count,
      query,
      reverse,
      sortKey,
      country: storefrontClient.i18n.country,
      language: storefrontClient.i18n.language,
    },
    cache: storefrontClient.CacheLong(),
  });

  invariant(products, 'No data returned from top products query');

  return json({
    products: flattenConnection(products),
  });
}

const PRODUCTS_QUERY = `#graphql
  query (
    $query: String
    $count: Int
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys
  ) @inContext(country: $country, language: $language) {
    products(first: $count, sortKey: $sortKey, reverse: $reverse, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

// no-op
export default function ProductsApiRoute() {
  return null;
}
