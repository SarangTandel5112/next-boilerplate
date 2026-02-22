import type { Metadata } from 'next';
import { getMessage } from '@/modules/common';

export const dynamic = 'force-static';
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: getMessage('About', 'meta_title'),
    description: getMessage('About', 'meta_description'),
  };
}

export default async function About() {
  return (
    <>
      <p>{getMessage('About', 'about_paragraph')}</p>
    </>
  );
};
