"use client"
import Image from "next/image"
import React, { useState, useRef, useEffect } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Camera, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export default function ConnectPage() {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [peerId, setPeerId] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const userId = user?.uid || null;

  const copyUserId = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Your user ID has been copied.",
      })
    }).catch(err => {
      console.error('Failed to copy: ', err)
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy user ID to clipboard.",
      })
    })
  }

  const activateCamera = async () => {
    setIsCameraActive(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        setHasCameraPermission(true)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setHasCameraPermission(false)
        setIsCameraActive(false) // Reset if permission is denied
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings.",
        })
      }
    }
  }

  const handleConnectionRequest = async () => {
    const trimmedPeerId = peerId.trim();
    if (!trimmedPeerId) {
        toast({
            variant: "destructive",
            title: "Invalid ID",
            description: "Please enter a valid User ID.",
        });
        return;
    }
     if (!user || !userId) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to send a connection request.",
      });
      return;
    }

    if (trimmedPeerId === userId) {
      toast({
        variant: "destructive",
        title: "Cannot Connect with Yourself",
        description: "You cannot send a connection request to your own ID.",
      });
      return;
    }

    setIsSendingRequest(true);

    try {
      // Check if peer exists
      const peerDocRef = doc(db, "users", trimmedPeerId);
      const peerDocSnap = await getDoc(peerDocRef);

      if (!peerDocSnap.exists()) {
        toast({
          variant: "destructive",
          title: "User Not Found",
          description: "No user exists with the provided ID.",
        });
        setIsSendingRequest(false);
        return;
      }

      const connectionId = [userId, trimmedPeerId].sort().join('_');
      const connectionRef = doc(db, "connections", connectionId);
      const docSnap = await getDoc(connectionRef);

      if (docSnap.exists()) {
        toast({
          title: "Connection Already Exists",
          description: "You are already connected or have a pending request with this user.",
        });
        setIsSendingRequest(false);
        return;
      }

      await setDoc(connectionRef, {
        users: [userId, trimmedPeerId],
        sender: userId,
        receiver: trimmedPeerId,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast({
          title: "Connection Request Sent",
          description: `Your request to connect with ${peerId} has been sent.`,
      })
      setPeerId("");

    } catch (error) {
       console.error("Error sending connection request:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send connection request. Please try again.",
      });
    } finally {
        setIsSendingRequest(false);
    }
  }


  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, []);


  return (
    <Tabs defaultValue="connect-id" className="w-full max-w-2xl mx-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="connect-id">Connect by ID</TabsTrigger>
        <TabsTrigger value="my-qr">My Code</TabsTrigger>
        <TabsTrigger value="scan">Scan Code</TabsTrigger>
      </TabsList>
      <TabsContent value="connect-id">
        <Card>
          <CardHeader>
            <CardTitle>Connect with User ID</CardTitle>
            <CardDescription>
              Enter the User ID of the person you want to connect with.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="peerId">User ID</Label>
              <div className="relative">
                <Input 
                  id="peerId" 
                  placeholder="Enter User ID" 
                  value={peerId}
                  onChange={(e) => setPeerId(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleConnectionRequest} disabled={!peerId.trim() || isSendingRequest}>
                {isSendingRequest ? "Sending..." : "Send Connection Request"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="my-qr">
        <Card>
          <CardHeader>
            <CardTitle>Your Connection Code</CardTitle>
            <CardDescription>
              Let another user scan this QR code to connect with you instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
             <div className="p-4 bg-white rounded-lg border min-h-[288px] min-w-[288px] flex items-center justify-center">
              {userId ? (
                 <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${userId}`}
                  alt="Your QR Code"
                  width={256}
                  height={256}
                />
              ) : (
                <Skeleton className="h-[256px] w-[256px]" />
              )}
            </div>
             {loading ? (
                <Skeleton className="h-4 w-3/4" />
             ) : userId ? (
                <p className="text-sm text-muted-foreground break-all">Your ID: {userId}</p>
             ) : (
                 <p className="text-sm text-muted-foreground">Please log in to see your ID.</p>
             )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={copyUserId} disabled={!userId || loading}>
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="scan">
        <Card>
          <CardHeader>
            <CardTitle>Scan Connection Code</CardTitle>
            <CardDescription>
              Use your camera to scan another user&apos;s QR code.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center border-dashed border-2 overflow-hidden">
              {isCameraActive && hasCameraPermission ? (
                 <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Camera className="mx-auto h-12 w-12 mb-2" />
                  <p>Camera view will appear here</p>
                </div>
              )}
            </div>
             {isCameraActive && hasCameraPermission === false && (
                <Alert variant="destructive">
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Please allow camera access to use this feature. You may need to refresh the page.
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
           <CardFooter>
            <Button className="w-full" onClick={activateCamera} disabled={isCameraActive}>
              {isCameraActive ? "Camera Active" : "Activate Camera"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

    