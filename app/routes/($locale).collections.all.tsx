import {redirect, type LoaderArgs} from '@vercel/remix';

export const config = {
  runtime: 'edge',
};

export async function loader({params}: LoaderArgs) {
  return redirect(params?.locale ? `${params.locale}/products` : '/products');
}
