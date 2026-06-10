import { Activity, type ReactNode } from "react";

type Props = {
  condition: boolean;
  children: ReactNode;
};

export const If = ({ condition, children }: Props) => (
  <Activity mode={condition ? "visible" : "hidden"}>{children}</Activity>
);
