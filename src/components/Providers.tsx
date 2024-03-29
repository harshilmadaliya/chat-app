"use client";
import React ,{FC, ReactNode} from "react";
import {Toaster } from "react-hot-toast";

interface ProvidersProps {
    children: ReactNode
}

const Providers: FC<ProvidersProps> = ({children}) => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={true} />
      {children}
    </>
  );
}

export default Providers;
