export type AdminNavigationId
  = | 'home'
    | 'products'
    | 'categories'
    | 'brands';

export type AdminRoutePath = `/${string}`;

export type AdminNavigationItem = {
  id: AdminNavigationId;
  label: string;
  path: AdminRoutePath;
  description: string;
};

export type AdminLayoutProps = {
  children: React.ReactNode;
  navigation: AdminNavigationItem[];
};
