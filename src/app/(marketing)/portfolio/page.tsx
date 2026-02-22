import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getMessage, ROUTES } from '@/modules/common';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: getMessage('Portfolio', 'meta_title'),
    description: getMessage('Portfolio', 'meta_description'),
  };
}

export default async function Portfolio() {
  return (
    <>
      <p>{getMessage('Portfolio', 'presentation')}</p>

      <div className="grid grid-cols-1 justify-items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Link
            className="hover:text-blue-700"
            key={i}
            href={ROUTES.PORTFOLIO_DETAIL(i)}
          >
            {getMessage('Portfolio', 'portfolio_name', { name: i })}
          </Link>
        ))}
      </div>

      <div className="mt-5 text-center text-sm">
        {`${getMessage('Portfolio', 'error_reporting_powered_by')} `}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo"
        >
          Sentry
        </a>
      </div>

      <a
        href="https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo"
      >
        <Image
          className="mx-auto mt-2"
          src="/assets/images/sentry-dark.png"
          alt="Sentry"
          width={128}
          height={38}
        />
      </a>
    </>
  );
};
