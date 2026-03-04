export type PageContainerProps = {
  children: React.ReactNode;
};

export const PageContainer = (props: PageContainerProps) => {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
        {props.children}
      </div>
    </div>
  );
};
