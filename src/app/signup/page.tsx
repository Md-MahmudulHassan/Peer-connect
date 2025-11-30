import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserAuthForm } from "@/components/user-auth-form"
import { AppLogo } from "@/components/app-logo"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
       <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <Link href="/" className="flex items-center gap-2 text-foreground">
              <AppLogo className="h-8 w-8" />
              <span className="text-2xl font-bold">PeerConnect</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-headline">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm formType="signup" />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
