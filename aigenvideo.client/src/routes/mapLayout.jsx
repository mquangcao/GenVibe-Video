import { MainLayout } from "@/components/Layouts";

const mapLayout = (routes) => {
  return routes.map((route) => {
    const { layout: Layout, element: Component, ...rest } = route;
    return {
      ...rest,
      element: Layout ? ( <Layout>{ <Component /> }</Layout> ) : (Layout === null ? ( <Component /> )
      : ( <MainLayout>{<Component />}</MainLayout> ))
    };
  });
};

export { mapLayout };