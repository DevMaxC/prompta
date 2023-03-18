import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import Image from "next/image";

import { Separator } from "@/components/ui/seperator";

import { useState } from "react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { LogOut, Settings, User, CreditCard } from "lucide-react";

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
import { useRouter } from "next/router";

export function Nav() {
  const { data: session } = useSession();
  const router = useRouter();

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
            <h1 className="cursor-not-allowed">Playground</h1>
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
                <DropdownMenuItem className="flex gap-2">
                  <Settings size={16} />
                  <Link href={"/settings"}>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="flex gap-2">
                  <User size={16} />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="flex gap-2">
                  <CreditCard size={16} />
                  Billing
                </DropdownMenuItem>
                {/* <DropdownMenuItem disabled>Subscription</DropdownMenuItem> */}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    router.push("https://discord.gg/R4q5zf7nDR");
                  }}
                  className="flex gap-2"
                >
                  <SiDiscord size={16} />
                  <h1>Join Discord</h1>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex gap-2"
                  onClick={() => signOut()}
                >
                  <LogOut size={16} />
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
