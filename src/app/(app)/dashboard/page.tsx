"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc, serverTimestamp, orderBy } from "firebase/firestore"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlusCircle, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelative } from 'date-fns';

interface ConnectionRequest {
  id: string;
  sender: string;
  senderEmail?: string;
}

interface Conversation {
    id: string;
    users: string[];
    otherUserName: string;
    otherUserAvatar: string;
    lastMessage: string;
    lastMessageTimestamp: any;
    unread: number;
}


export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  // Fetch Connection Requests
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "connections"),
        where("receiver", "==", user.uid),
        where("status", "==", "pending")
      );

      const unsubscribeFirestore = onSnapshot(q, async (querySnapshot) => {
        const requests: ConnectionRequest[] = [];
        for (const docSnapshot of querySnapshot.docs) {
           const senderId = docSnapshot.data().sender;
           const userDocRef = doc(db, "users", senderId);
           const userDocSnap = await getDoc(userDocRef);
           if (userDocSnap.exists()) {
             const senderEmail = userDocSnap.data().email || 'Unknown User';
             requests.push({ id: docSnapshot.id, sender: senderId, senderEmail });
           }
        }
        setConnectionRequests(requests);
      });

      return () => unsubscribeFirestore();
    }
  }, [user]);

  // Fetch Accepted Conversations
  useEffect(() => {
    if (user) {
        setLoading(true);
        const q = query(
            collection(db, "connections"),
            where("users", "array-contains", user.uid),
            where("status", "==", "accepted"),
            orderBy("lastMessageTimestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const convos: Conversation[] = [];
            for (const docSnapshot of querySnapshot.docs) {
                const data = docSnapshot.data();
                const otherUserId = data.users.find((uid: string) => uid !== user.uid);
                
                if (otherUserId) {
                    const userDocRef = doc(db, "users", otherUserId);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                       const otherUserData = userDocSnap.data();
                       convos.push({
                           id: docSnapshot.id,
                           users: data.users,
                           otherUserName: otherUserData.email || 'Peer User', // Or a displayName if you store it
                           otherUserAvatar: `https://placehold.co/40x40.png?text=${(otherUserData.email || 'P').charAt(0).toUpperCase()}`,
                           lastMessage: data.lastMessage || "No messages yet.",
                           lastMessageTimestamp: data.lastMessageTimestamp,
                           unread: 0, // Implement unread count later
                       });
                    }
                }
            }
            setConversations(convos);
            setLoading(false);
        });

        return () => unsubscribe();
    }
  }, [user]);


  const handleAcceptRequest = async (request: ConnectionRequest) => {
    if (!user) return;
    try {
      const connectionDocRef = doc(db, "connections", request.id);
      
      await updateDoc(connectionDocRef, {
        status: "accepted",
        acceptedAt: serverTimestamp(),
        lastMessageTimestamp: serverTimestamp(),
      });

      const chatId = request.id;
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
          await setDoc(chatDocRef, {
            users: [user.uid, request.sender],
            createdAt: serverTimestamp(),
        });
      }

      toast({
        title: "Connection Accepted",
        description: "You can now start a conversation.",
      });
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not accept the connection request.",
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
     try {
      await deleteDoc(doc(db, "connections", requestId));
      toast({
        title: "Connection Declined",
        description: "The request has been removed.",
      });
    } catch (error) {
       console.error("Error declining request:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not decline the connection request.",
      });
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      return formatRelative(timestamp.toDate(), new Date());
    } catch(e) {
      return '';
    }
  };

  if (loading || !user) {
      return (
        <div className="flex flex-col h-full gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Messages</CardTitle>
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {connectionRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Requests</CardTitle>
            <CardDescription>You have {connectionRequests.length} new request(s).</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <ul className="divide-y">
                {connectionRequests.map((req) => (
                  <li key={req.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-semibold">{req.senderEmail || req.sender.substring(0, 10)}...</p>
                      <p className="text-sm text-muted-foreground">Wants to connect.</p>
                    </div>
                    <div className="flex gap-2">
                       <Button size="icon" variant="outline" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleAcceptRequest(req)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDeclineRequest(req.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
             </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Messages</CardTitle>
            </div>
            <Button asChild variant="ghost" size="icon">
                <Link href="/connect">
                    <PlusCircle className="h-6 w-6" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent className="p-0">
          {conversations.length > 0 ? (
            <ul className="divide-y">
              {conversations.map((convo) => (
                <li key={convo.id}>
                  <Link href={`/chat/${convo.id}`} className="flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={convo.otherUserAvatar} alt={convo.otherUserName} />
                      <AvatarFallback>{convo.otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{convo.otherUserName}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">{convo.lastMessage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-primary">{formatTimestamp(convo.lastMessageTimestamp)}</p>
                      {convo.unread > 0 && (
                        <span className="mt-1 ml-auto inline-block bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">No conversations yet.</p>
              <p className="text-sm text-muted-foreground">Start a new one from the Connect page.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

    