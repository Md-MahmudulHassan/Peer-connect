"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot, collection, query, orderBy, getDoc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, Video, Send, Paperclip, Smile } from "lucide-react"

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: any;
}

interface PeerUser {
    name: string;
    avatar: string;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [peerUser, setPeerUser] = useState<PeerUser | null>(null);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch peer user info
  useEffect(() => {
      if (!user) return;

      const fetchPeerUser = async () => {
          const chatId = params.id;
          const connectionDocRef = doc(db, "connections", chatId);
          const connectionDocSnap = await getDoc(connectionDocRef);

          if (connectionDocSnap.exists()) {
              const connectionData = connectionDocSnap.data();
              const peerId = connectionData.users.find((uid: string) => uid !== user.uid);
              if (peerId) {
                  const userDocRef = doc(db, "users", peerId);
                  const userDocSnap = await getDoc(userDocRef);
                  if (userDocSnap.exists()) {
                      const userData = userDocSnap.data();
                      setPeerUser({
                          name: userData.email || 'Peer User',
                          avatar: `https://placehold.co/40x40.png?text=${(userData.email || 'P').charAt(0).toUpperCase()}`
                      });
                  }
              }
          }
      };

      fetchPeerUser();
  }, [user, params.id]);


  useEffect(() => {
    if (!user) return;
    
    const chatId = params.id;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribeMessages();

  }, [user, params.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newMessage.trim() === "" || !user) return;

      const chatId = params.id;
      try {
          await addDoc(collection(db, "chats", chatId, "messages"), {
              sender: user.uid,
              content: newMessage,
              timestamp: serverTimestamp()
          });
          setNewMessage("");

          // Also update the last message on the connection document
          const connectionDocRef = doc(db, "connections", chatId);
          await updateDoc(connectionDocRef, {
              lastMessage: newMessage,
              lastMessageTimestamp: serverTimestamp()
          });

      } catch (error) {
          console.error("Error sending message: ", error);
          // Consider showing a toast here
      }
  }


  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-card rounded-xl border">
      <header className="flex items-center p-3 border-b">
        <Avatar>
          <AvatarImage src={peerUser?.avatar} alt={peerUser?.name} />
          <AvatarFallback>{peerUser?.name ? peerUser.name.charAt(0).toUpperCase() : 'P'}</AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <h2 className="text-lg font-semibold">{peerUser?.name || 'Loading...'}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4 bg-muted/30">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${message.sender === user?.uid ? 'justify-end' : ''}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2 shadow-sm ${
                  message.sender === user?.uid
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background'
                }`}
              >
                <p>{message.content}</p>
                 <p className={`text-xs mt-1 text-right ${message.sender === user?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <footer className="p-3 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button variant="ghost" size="icon" type="button">
              <Smile className="h-6 w-6 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" type="button">
              <Paperclip className="h-6 w-6 text-muted-foreground" />
            </Button>
          <Input 
            placeholder="Type a message..." 
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button size="icon" type="submit" disabled={!newMessage.trim()}>
              <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  )
}

    