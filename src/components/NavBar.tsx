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
import { Button } from "./ui/button";

export function Nav() {
  const { data: session } = useSession();

  return (
    <nav className="flex w-full items-center justify-between border-b border-black/10 p-4">
      <div>
        <h1 className="text-xl font-semibold">Prompta</h1>
      </div>
      <div className="flex items-center gap-4">
        {session && (
          <div className="flex items-center gap-4">
            <Link href="/workflows">Workflows</Link>
            <Link href="/blocks">Blocks</Link>
            <Link href="/playground">Playground</Link>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {!session && (
          <div className="flex items-center gap-4">
            <Button onClick={() => signIn()}>Sign In</Button>
          </div>
        )}
      </div>
    </nav>
  );
}
