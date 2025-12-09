import { Mail, CheckCircle } from "lucide-react";

interface EmailNoticeProps {
  email: string;
}

export function EmailNotice({ email }: EmailNoticeProps) {
  return (
    <div className="flex items-center gap-3 bg-success/10 text-success-foreground rounded-xl px-4 py-3 animate-fade-in">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-primary-foreground shrink-0">
        <Mail className="h-4 w-4" />
      </div>
      <p className="text-sm">
        <span className="font-medium">Results sent!</span>{" "}
        <span className="text-muted-foreground">
          We've emailed your child's results and action plan to{" "}
          <span className="font-medium text-foreground">{email}</span> so you can refer back anytime.
        </span>
      </p>
    </div>
  );
}
