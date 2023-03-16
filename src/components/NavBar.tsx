import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import Image from "next/image";
import { User } from "lucide-react";

import { Separator } from "@/components/ui/seperator";

import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

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
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full p-0.5">
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={"/settings"}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Account</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
