import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import Image from "next/image";
import { User } from "lucide-react";

import { Separator } from "@/components/ui/seperator";

import { useState } from "react";

export function Nav() {
  const { data: session } = useSession();

  return (
    <nav className="flex w-full items-center justify-between rounded-lg bg-slate-200 p-4">
      <div>
        <h1 className="text-xl font-semibold">Prompta</h1>
      </div>
      <div className="flex items-center gap-4">
        {session && (
          <div className="flex gap-4">
            <Link href="/workflows">Workflows</Link>
            <Link href="/blocks">Blocks</Link>
            <Link href="/playground">Playground</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        )}
        <UserProfileButton />
      </div>
    </nav>
  );
}

function UserProfileButton() {
  const { data: session } = useSession();

  const [showContextMenu, setShowContextMenu] = useState(false);

  if (!session) {
    return <button onClick={() => signIn()}>Sign in</button>;
  }

  if (!session?.user?.image) {
    return <button className="h-16 w-16 rounded-full bg-black"></button>;
  }

  return (
    <div>
      <button
        onClick={() => setShowContextMenu(!showContextMenu)}
        className="relative h-10 w-10 rounded-full bg-black"
      >
        {session?.user?.image && (
          <Image
            className=" rounded-full ring-1 ring-offset-2"
            src={session?.user?.image}
            alt="User profile picture"
            fill
          />
        )}
      </button>
      <div>
        {showContextMenu && (
          <div className="absolute right-8 top-16 flex w-40 flex-col items-center rounded-lg border bg-slate-100 text-center">
            <h1 className="py-2 opacity-70">Personal</h1>
            <Separator />
            <div className="flex flex-col gap-1 py-2">
              <Link href={"/Settings"}> Settings </Link>
              <Link href={"/Account"}> Account </Link>
              <Link href={"/Billing"}> Billing </Link>
              <button onClick={() => signOut()}>Sign out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
