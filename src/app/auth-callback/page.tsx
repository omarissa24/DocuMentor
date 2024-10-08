"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
// import { Suspense } from "react";

const Page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, isSuccess, error } = trpc.authCallback.useQuery();

  if (isSuccess) {
    router.push(origin || "/dashboard");
  }

  if (error && error.data?.code === "UNAUTHORIZED") {
    router.push("/sign-in");
  }

  return (
    // <Suspense fallback={null}>
    <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
        <h3 className='font-semibold text-xl'>Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
    // </Suspense>
  );
};

export default Page;
