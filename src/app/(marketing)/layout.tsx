import Link from 'next/link';
import { DemoBanner, getMessage, ROUTES } from '@/modules/common';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DemoBanner />
      <BaseTemplate
        leftNav={(
          <>
            <li>
              <Link
                href={ROUTES.HOME}
                className="border-none text-gray-700 hover:text-gray-900"
              >
                {getMessage('RootLayout', 'home_link')}
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.ABOUT}
                className="border-none text-gray-700 hover:text-gray-900"
              >
                {getMessage('RootLayout', 'about_link')}
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.COUNTER}
                className="border-none text-gray-700 hover:text-gray-900"
              >
                {getMessage('RootLayout', 'counter_link')}
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.PORTFOLIO}
                className="border-none text-gray-700 hover:text-gray-900"
              >
                {getMessage('RootLayout', 'portfolio_link')}
              </Link>
            </li>
            <li>
              <a
                className="border-none text-gray-700 hover:text-gray-900"
                href="https://github.com/ixartz/Next-js-Boilerplate"
              >
                GitHub
              </a>
            </li>
          </>
        )}
      >
        <div className="py-5 text-xl [&_p]:my-6">{props.children}</div>
      </BaseTemplate>
    </>
  );
}
