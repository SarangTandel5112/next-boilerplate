import { BaseTemplate } from '@/templates/BaseTemplate';

export default function MarketingLoading() {
  return (
    <BaseTemplate leftNav={<></>}>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"
          aria-hidden
        />
      </div>
    </BaseTemplate>
  );
}
