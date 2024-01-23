'use client'
import React, { useState } from "react";
import Button from "./ui/Button";
import { addFriendValidator } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type FormData = z.infer<typeof addFriendValidator>;

function AddFriendButton() {
  const [showSuccessState, setshowSuccessState] = useState(false);

  const { register, handleSubmit, setError , formState : {errors} } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  const addFriend = async (email: string) => {
    try {
      const validatedEmail = addFriendValidator.parse({ email });

      await axios.post("/api/friends/add", {
        email: validatedEmail,
      });

      setshowSuccessState(true);
    } catch (error) {
      console.log("error")
      if (error instanceof z.ZodError) {
        // if error is accured by ZOD
        setError("email", { message: error.message });
        return;
      }
      if (error instanceof AxiosError) {
        // if error is accured by axios
        setError("email", { message: error.message });
        return;
      }
      setError("email", { message: "Something went Worng" });
    }
  };

  const onsubmit = (data: FormData) => {
    addFriend(data.email);
  };
  return (
    <form onSubmit={handleSubmit(onsubmit)} className="max-w-sm">
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add Friend by E-Mail
      </label>

      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="email"
          className="block w-2/3 md:w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-900 sm:text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        <Button>Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
      {showSuccessState ? (
        <p className="mt-1 text-sm text-green-600">Friend request sent</p>
      ) : null}
    </form>
  );
}

export default AddFriendButton;
