import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { get } from "http";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  // check if user is logged in
  if (!user || !user.id) {
    redirect("/auth-callback?origin=dashboard");
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  // check if user in db
  if (!dbUser) {
    redirect("/auth-callback?origin=dashboard");
  }

  return <Dashboard />;
};

export default Page;
