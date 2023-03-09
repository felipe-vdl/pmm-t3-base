import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Provider as JotaiProvider } from "jotai";

import { api } from "@/utils/api";

import "@/styles/globals.css";

import DashboardLayout from "@/components/layout/Dashboard";
import RegularLayout from "@/components/layout/Regular";
import NoLayout from "@/components/layout/NoLayout";
import { AppPropsType } from 'next/dist/shared/lib/utils';
type NextLayoutComponentType = AppPropsType['Component'] & { layout: "dashboard" | "regular" | "none";};

const layouts = {
  dashboard: DashboardLayout,
  regular: RegularLayout,
  none: NoLayout,
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const CustomComponent = Component as NextLayoutComponentType;
  const Layout = layouts[CustomComponent.layout] || NoLayout;

  return (
    <SessionProvider session={session}>
      <JotaiProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </JotaiProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
