import { GetServerSideProps } from "next";
import { getServerAuthSession } from "@/server/auth";
import Head from "next/head";
import { useSession } from "next-auth/react";

const IndexPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <div className="m-auto">
        {session?.user.name && (
          <h1 className="text-3xl font-medium">
            Olá, {session?.user.name.split(" ")[0]}.
          </h1>
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerAuthSession({ req, res });

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
      props: {},
    };
  } else {
    return {
      props: {},
    };
  }
};

IndexPage.layout = "dashboard";
export default IndexPage;
