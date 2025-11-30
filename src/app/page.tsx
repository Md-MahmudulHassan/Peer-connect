import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLogo } from "@/components/app-logo"
import { MessageSquare, Phone, QrCode, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppLogo className="h-6 w-6" />
            <span className="font-bold inline-block">PeerConnect</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              Private, Peer-to-Peer Connections.
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
              Experience true privacy with end-to-end encrypted video calls and messaging. No servers, no logs, just direct connection.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 lg:py-28 bg-muted/50">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Features Built for Privacy</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg mt-4">
                Everything you need for secure communication.
              </p>
            </div>
            <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    P2P Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Crystal-clear audio and video calls directly between you and your peer, with no middleman.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Real-time Messaging
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Instant, secure messaging. Messages are self-destructed from your device after delivery.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    QR Code Pairing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Quickly and securely connect with new peers by scanning a QR code. No need to share personal info.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Local First
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Your data is yours. All messages are stored locally and removed upon delivery, ensuring maximum privacy.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex items-center justify-between h-16">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} PeerConnect. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
            <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
