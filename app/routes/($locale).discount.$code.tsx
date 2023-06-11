import {redirect, type LoaderArgs} from '@vercel/remix';

import {commitSession, getSession} from '~/lib/session';
import {getStorefrontClient} from '~/lib/storefrontClient';

import {cartCreate, cartDiscountCodesUpdate} from './($locale).cart';

export const config = {
  runtime: 'edge',
};

/**
 * Automatically applies a discount found on the url
 * If a cart exists it's updated with the discount, otherwise a cart is created with the discount already applied
 * @param ?redirect an optional path to return to otherwise return to the home page
 * @example
 * Example path applying a discount and redirecting
 * ```ts
 * /discount/FREESHIPPING?redirect=/products
 *
 * ```
 * @preserve
 */
export async function loader({request, params}: LoaderArgs) {
  const storefrontClient = getStorefrontClient(request);
  const session = await getSession(request.headers.get('Cookie'));
  // N.B. This route will probably be removed in the future.
  const {code} = params;

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const redirectParam =
    searchParams.get('redirect') || searchParams.get('return_to') || '/';

  searchParams.delete('redirect');
  searchParams.delete('return_to');

  const redirectUrl = `${redirectParam}?${searchParams}`;
  const headers = new Headers();

  if (!code) {
    return redirect(redirectUrl);
  }

  let cartId = session.get('cartId');

  //! if no existing cart, create one
  if (!cartId) {
    const {cart, errors: graphqlCartErrors} = await cartCreate({
      input: {},
      storefrontClient,
    });

    if (graphqlCartErrors?.length) {
      return redirect(redirectUrl);
    }

    //! cart created - we only need a Set-Cookie header if we're creating
    cartId = cart.id;
    session.set('cartId', cartId);
    headers.set('Set-Cookie', await commitSession(session));
  }

  //! apply discount to the cart
  await cartDiscountCodesUpdate({
    cartId,
    discountCodes: [code],
    storefrontClient,
  });

  return redirect(redirectUrl, {headers});
}
