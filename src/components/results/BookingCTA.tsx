import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Phone } from "lucide-react";

export function BookingCTA() {
  // Placeholder URL - replace with actual booking link
  const bookingUrl = "https://bestlessonever.com/book";

  return (
    <div 
      className="bg-gradient-to-br from-primary/10 via-card to-accent/5 rounded-2xl p-6 sm:p-8 shadow-card border border-primary/20 animate-slide-up"
      style={{ animationDelay: '0.3s' }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-cta mb-4 shadow-glow">
          <Calendar className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Want a Teacher to Guide the Next Step?
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          <span className="font-semibold text-foreground">Best Lesson Ever</span> is a modern, 
          student-led music school in Friendswood, TX. We match your child with a teacher who 
          fits their personality, goals, and readiness level — using the same principles behind this quiz.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          size="lg" 
          variant="hero" 
          asChild
          className="group"
        >
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
            <Phone className="h-5 w-5 mr-2" />
            Book a Lesson Planning Call
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </a>
        </Button>
      </div>

      {/* Secondary link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Prefer to browse first?{" "}
        <a 
          href="https://bestlessonever.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Visit our main site
        </a>
      </p>
    </div>
  );
}
