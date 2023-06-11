import {redirect, type LoaderArgs} from '@vercel/remix';

export async function loader({params}: LoaderArgs) {
  return redirect(params?.locale ? `${params.locale}/products` : '/products');
}
