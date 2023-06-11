import {
  redirect,
  type ActionFunction,
  type LoaderArgs,
  type ActionArgs,
} from '@vercel/remix';

import {getSession, commitSession} from '~/lib/session';
import {getStorefrontClient} from '~/lib/storefrontClient';

export async function doLogout(request: Request) {
  const storefrontClient = getStorefrontClient(request);
  const session = await getSession(request.headers.get('Cookie'));
  session.unset('customerAccessToken');

  // The only file where I have to explicitly type cast i18n to pass typecheck
  return redirect(`${storefrontClient.i18n.pathPrefix}/account/login`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function loader({request}: LoaderArgs) {
  const storefrontClient = getStorefrontClient(request);
  return redirect(storefrontClient.i18n.pathPrefix);
}

export const action: ActionFunction = async ({request}: ActionArgs) => {
  return doLogout(request);
};
