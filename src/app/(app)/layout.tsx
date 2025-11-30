"use client"
import Link from "next/link"
import {
  MessageSquare,
  LogOut,
  Settings,
  User,
  UserPlus,
} from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppLogo } from "@/components/app-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import React from "react"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = React.useState<import("firebase/auth").User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarContent className="p-0 flex flex-col justify-between">
          <div>
            <SidebarHeader className="p-2">
               <div className="flex items-center justify-between">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-2 h-auto">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://placehold.co/40x40.png?text=${user?.email?.charAt(0).toUpperCase() || 'U'}`} alt="@user" />
                          <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                           {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                         <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                       <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex items-center gap-2">
                     <Button asChild variant="ghost" size="icon">
                        <Link href="/connect">
                          <UserPlus className="h-5 w-5" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon">
                        <Link href="/dashboard">
                          <MessageSquare className="h-5 w-5" />
                        </Link>
                      </Button>
                  </div>
               </div>
            </SidebarHeader>
            <div className="p-2">
              {children}
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="md:p-0">
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
