import navbarLogo from "@/assets/navbar-logo.png";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ThemeToggler from "./ThemeToggler";
import Router from "next/router";
import { api } from "@/utils/api";

export default function Navbar() {
  const { status } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    Router.push("/login");
  };

  const { data: userData } = api.user.getUserInfo.useQuery(undefined, {
    onSuccess: async (data) => {
      if (data) {
        if (!data.is_enabled) {
          await signOut({ redirect: false });
          Router.push("/login");
        }
      }
    },
    enabled: status === "authenticated"
  });

  return (
    <header
      className={`bg-dourado z-10 px-6 text-2xl font-bold text-white shadow shadow-black/30`}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
        <Link href="/">
          <Image
            src={navbarLogo}
            height={70}
            alt="Mesquita SGP"
            className="py-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          />
        </Link>
        <ul className="relative flex items-center gap-6 self-stretch">
          {status === "unauthenticated" && (
            <>
              <li>
                <Link href="/login">LOGIN</Link>
              </li>
            </>
          )}
          <li>
            <ThemeToggler />
          </li>
          {status === "authenticated" && (
            <li className="group flex cursor-pointer items-center self-stretch">
              {userData && (
                <button className="bg-roxo rounded-full py-1 px-3 text-3xl">
                  {userData.name.charAt(0)}
                </button>
              )}
              <div className="bg-light-500 text-light-50 dark:border-dark-500 dark:bg-dark-500 dark:text-dark-50 absolute left-[-1.5rem] top-[5.9rem] z-10 hidden w-[8rem] flex-col items-end border border-t-0 text-base font-light shadow shadow-black/30 hover:flex group-hover:flex sm:top-[5.9rem] md:top-[5.9rem]">
                <Link
                  className="light:border-light-500 hover:bg-light-900 dark:border-dark-900 dark:hover:bg-dark-900 w-full border-b p-2 text-end"
                  href="/changepassword"
                >
                  Alterar Senha
                </Link>
                <button
                  className="hover:bg-light-900 dark:hover:bg-dark-900 w-full p-2 text-end"
                  onClick={handleSignOut}
                >
                  Sair
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
