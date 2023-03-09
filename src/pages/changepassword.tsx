import React, { useState } from "react";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";

import { AppNotification, Message } from "@/types/interfaces";
import { GetServerSideProps } from "next";

import Head from "next/head";

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePasswordPage = () => {
  const notificationInitialState: AppNotification = { message: "", type: "" };
  const [notification, setNotification] = useState<AppNotification>(
    notificationInitialState
  );
  const formInitalState: ChangePasswordForm = {
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const [form, setForm] = useState<ChangePasswordForm>(formInitalState);

  const changePasswordMutation = api.user.changePassword.useMutation({
    onSuccess: (data: Message) => {
      setNotification({ type: "success", message: data.message });
      setForm(formInitalState);
      return data;
    },
    onMutate: () => {
      setNotification(notificationInitialState);
    },
    onError: (err: Message) => {
      if (err.message) {
        setNotification({ type: "error", message: err.message });
      }
    },
  });

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      if (Object.values(form).every((entry) => entry.trim().length > 0)) {
        changePasswordMutation.mutate(form);
      } else {
        setNotification({
          type: "error",
          message: "Preencha as informações.",
        });
      }
    } catch (error: any) {
      setNotification({
        message: error?.message ?? "Ocorreu um erro.",
        type: "error",
      });
    }
  };

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm((st) => ({ ...st, [evt.target.name]: evt.target.value }));
  };

  return (
    <>
      <Head>
        <title>Alterar Senha</title>
      </Head>
      <div className="m-auto flex w-full flex-col items-center rounded-[12px] bg-light-500 text-white shadow shadow-black/20 dark:bg-dark-500 sm:w-[25rem] md:w-[30rem] lg:w-[38rem]">
        <div className="w-full rounded-t-[12px] bg-dourado py-1 text-center">
          <h2 className="text-2xl font-light">Alterar Senha</h2>
        </div>
        <form
          className="flex w-full flex-col gap-8 p-4 pt-8"
          onSubmit={handleSubmit}
        >
          {notification.message && (
            <div
              className={`flex w-full items-center rounded-[8px] px-3 py-1 text-center ${
                notification.type === "error"
                  ? "bg-red-300 text-red-800"
                  : "bg-green-300 text-green-800"
              }`}
            >
              <p className="mx-auto">{notification.message}</p>
              <span
                className="cursor-pointer hover:text-white"
                onClick={() => setNotification(notificationInitialState)}
              >
                X
              </span>
            </div>
          )}
          <div className="flex flex-col gap-6 px-1">
            <input
              type="password"
              onChange={handleChange}
              name="currentPassword"
              value={form.currentPassword}
              className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
              placeholder="Senha Atual"
            />
            <input
              type="password"
              onChange={handleChange}
              name="newPassword"
              value={form.newPassword}
              className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
              placeholder="Nova Senha"
            />
            <input
              type="password"
              onChange={handleChange}
              name="confirmNewPassword"
              value={form.confirmNewPassword}
              className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
              placeholder="Confirmar Nova Senha"
            />
          </div>
          <button
            disabled={changePasswordMutation.isLoading}
            className="rounded-[10px] bg-roxo p-1 text-xl font-light hover:bg-indigo-500 disabled:bg-indigo-400"
          >
            {changePasswordMutation.isLoading ? "Aplicando..." : "Aplicar"}
          </button>
        </form>
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

ChangePasswordPage.layout = "dashboard";
export default ChangePasswordPage;
