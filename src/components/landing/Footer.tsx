import bleLogoIcon from "@/assets/ble-logo-icon.png";
export function Footer() {
  return <footer className="py-8 px-4 bg-card border-t border-border">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-foreground">
          <img src={bleLogoIcon} alt="" className="h-5 w-5" />
          <span className="font-semibold">Best Lesson Ever</span>
        </div>

        <div className="text-sm text-muted-foreground text-center sm:text-right">
          <p>A modern, student-focused music school in Friendswood, TX</p>
          <a target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-1 inline-block" href="https://bestlessonever.com/friendswood">
            Visit our main site →
          </a>
        </div>
      </div>
    </footer>;
}