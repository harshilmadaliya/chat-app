"use client";

import { Loader2, LogOut } from "lucide-react";
import React, { ButtonHTMLAttributes, FC, useState } from "react";
import { toast } from "react-hot-toast";
import Button from "./ui/Button";
import { signOut } from "next-auth/react";

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  return (
    <Button
      {...props}
      variant="ghost"
      onClick={async () => {
        console.log("clicked")
        setIsSigningOut(true);
        try {
          await signOut()
          console.log("signOut");
        } catch (error) {
          toast.error("There was a problem signing out");
        } finally {
          setIsSigningOut(false);
        }
      }}
    >
      {isSigningOut ? (
        <>
          {console.log("loder")}
          <Loader2 className="animate-spin h-4 w-4" />
        </>
      ) : (
        <>
          
          <LogOut className="w-4 h-4" />
        </>
      )}
    </Button>
  );
};

export default SignOutButton;
