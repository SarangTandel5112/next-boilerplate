import dynamic from 'next/dynamic';

const EditProductPageView = dynamic(
  () => import('@/modules/products').then(module => module.EditProductView),
);

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return <EditProductPageView id={id} />;
}
