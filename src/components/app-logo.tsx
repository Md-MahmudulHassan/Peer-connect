import { MessageSquare } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLogo(props: LucideProps) {
  return <MessageSquare className={cn("text-primary", props.className)} {...props} />;
}
