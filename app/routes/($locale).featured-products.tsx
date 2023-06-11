import {json, type LoaderArgs} from '@vercel/remix';
import {flattenConnection} from '@shopify/hydrogen';
import type {
  CollectionConnection,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';

import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getStorefrontClient} from '~/lib/storefrontClient';

export const config = {
  runtime: 'edge',
};

export async function loader({request}: LoaderArgs) {
  return json(await getFeaturedData(request));
}

export async function getFeaturedData(request: Request) {
  const storefrontClient = getStorefrontClient(request);
  const data = await storefrontClient.query<{
    featuredCollections: CollectionConnection;
    featuredProducts: ProductConnection;
  }>(FEATURED_QUERY, {
    variables: {
      country: storefrontClient.i18n.country,
      language: storefrontClient.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  return {
    featuredCollections: flattenConnection(data.featuredCollections),
    featuredProducts: flattenConnection(data.featuredProducts),
  };
}

const FEATURED_QUERY = `#graphql
  query homepage($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
    featuredProducts: products(first: 12) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
