import type { Metadata } from 'next';
import Image from 'next/image';
import { getMessage } from '@/modules/common';

export const revalidate = 3600;

export function generateStaticParams() {
  return Array.from({ length: 6 }, (_, i) => ({
    slug: `${i}`,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  return {
    title: getMessage('PortfolioSlug', 'meta_title', { slug }),
    description: getMessage('PortfolioSlug', 'meta_description', { slug }),
  };
}

export default async function PortfolioDetail(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  return (
    <>
      <h1 className="capitalize">
        {getMessage('PortfolioSlug', 'header', { slug })}
      </h1>
      <p>{getMessage('PortfolioSlug', 'content')}</p>

      <div className="mt-5 text-center text-sm">
        {`${getMessage('PortfolioSlug', 'code_review_powered_by')} `}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025"
        >
          CodeRabbit
        </a>
      </div>

      <a
        href="https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025"
      >
        <Image
          className="mx-auto mt-2"
          src="/assets/images/coderabbit-logo-light.svg"
          alt="CodeRabbit"
          width={128}
          height={22}
        />
      </a>
    </>
  );
};

export const dynamicParams = false;
