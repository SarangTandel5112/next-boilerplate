import { redirect } from 'next/navigation';

// Temporary route fallback while product create UI is unavailable.
// Remove this redirect when the products module is reintroduced.
export default function CreateProductPage() {
  redirect('/admin/products');
}
