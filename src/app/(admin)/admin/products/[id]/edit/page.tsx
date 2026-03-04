import { redirect } from 'next/navigation';

// Temporary route fallback while product edit UI is unavailable.
// Remove this redirect when the products module is reintroduced.
export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  await props.params;

  redirect('/admin/products');
}
