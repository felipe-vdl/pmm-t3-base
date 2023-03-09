import { GetServerSideProps } from "next/types";
import { getServerAuthSession } from "@/server/auth";

const HomePage = () => {
  return <div>HomePage</div>;
};

export const getServerSideProps: GetServerSideProps  = async ({req, res}) => {
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
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
};

HomePage.layout = "regular";
export default HomePage;
