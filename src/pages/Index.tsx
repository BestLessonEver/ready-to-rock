import { useRef } from "react";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyItMatters } from "@/components/landing/WhyItMatters";
import { Footer } from "@/components/landing/Footer";
import { QuizForm } from "@/components/quiz/QuizForm";

const Index = () => {
  const quizRef = useRef<HTMLDivElement>(null);

  const scrollToQuiz = () => {
    quizRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero onStartQuiz={scrollToQuiz} />

      {/* How It Works */}
      <HowItWorks />

      {/* Why It Matters */}
      <WhyItMatters />

      {/* Quiz Section */}
      <section
        ref={quizRef}
        id="quiz"
        className="py-16 px-4 gradient-hero"
      >
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Let's Get Started
            </h2>
            <p className="text-muted-foreground">
              Answer a few quick questions about your child
            </p>
          </div>

          <QuizForm />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;