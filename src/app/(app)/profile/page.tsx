"use client"

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="https://placehold.co/80x80.png" alt="@user" />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : (
              <>
                <CardTitle className="text-3xl">{user?.displayName || user?.email || "User Name"}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <Skeleton className="h-4 w-1/2" />
        ) : user ? (
          <div>
            <p className="text-sm font-semibold">User ID:</p>
            <p className="text-sm text-muted-foreground">{user.uid}</p>
          </div>
        ) : (
          <p>Please log in to view your profile.</p>
        )}
      </CardContent>
    </Card>
  )
}
