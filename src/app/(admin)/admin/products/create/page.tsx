import dynamic from 'next/dynamic';

const CreateProductPageView = dynamic(
  () => import('@/modules/products').then(module => module.CreateProductView),
);

export default function CreateProductPage() {
  return <CreateProductPageView />;
}
