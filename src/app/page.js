'use client'
import Image from "next/image";
import { useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCreateUserOnLogin } from "./components/createuserlogin";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import nProgress from "nprogress";
import Requestfilter from "./components/Requestsfilter";
export default function Home() {
  const { user } = useUser();
  useCreateUserOnLogin();
  return (
    <>
      <div>
        <Requestfilter/>
      </div>
    </>
  );
}

