import { Button } from "@/components/ui/button";
import { Music, Sparkles } from "lucide-react";
interface HeroProps {
  onStartQuiz: () => void;
}
export function Hero({
  onStartQuiz
}: HeroProps) {
  return <section className="relative min-h-[85vh] flex items-center justify-center px-4 gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 animate-float" />
        <div className="absolute top-40 right-10 w-16 h-16 rounded-full bg-accent/20 animate-float" style={{
        animationDelay: '1s'
      }} />
        <div className="absolute bottom-32 left-20 w-12 h-12 rounded-full bg-primary/15 animate-float" style={{
        animationDelay: '2s'
      }} />
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-accent/10 animate-float" style={{
        animationDelay: '0.5s'
      }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary animate-fade-in">
          <Music className="h-4 w-4" />
          <span className="text-sm font-medium">90-second quiz</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-slide-up">
          Is Your Child Ready for{" "}
          <span className="text-gradient">Music Lessons</span>?
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto animate-slide-up" style={{
        animationDelay: '0.1s'
      }}>Finish this quiz to get a personalized Music Readiness Score, Best-Fit Instrument, and a 1 Week Action Plan.</p>

        {/* CTA Button */}
        <div className="pt-4 animate-slide-up" style={{
        animationDelay: '0.2s'
      }}>
          <Button size="xl" variant="hero" onClick={onStartQuiz} className="group">
            <Sparkles className="h-5 w-5 mr-2 transition-transform group-hover:rotate-12" />
            Start the Readiness Quiz
          </Button>
        </div>

        {/* Trust line */}
        <p className="text-sm text-muted-foreground animate-fade-in" style={{
        animationDelay: '0.4s'
      }}>Created by Best Lesson Ever, a modern, student-focused music school in Friendswood, TX.<span className="font-semibold text-foreground">Best Lesson Ever</span>, 
          a modern, student-led music school in Friendswood, TX.
        </p>
      </div>
    </section>;
}