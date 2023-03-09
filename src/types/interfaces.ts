import { User } from "@prisma/client";

export type UserInfo = Omit<User, "created_at" | "updated_at" | "password">;

export type UserSession = {
  id?: string;
  name?: string | null | undefined;
  role?: string;
  email?: string | null | undefined;
};

export type Message = { message: string };

export type AppNotification = {
  message: string;
  type: "error" | "success" | "";
};

export type AppDialog = {
  isOpen: boolean;
  message: string;
  accept: () => any;
  reject: () => any;
};