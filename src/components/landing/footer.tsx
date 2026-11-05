import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-subtle">The gist of any article in seconds. Paste a link, read three sentences, move on.</p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold">Product</p>
            <ul className="mt-3 space-y-2 text-subtle">
              <li><Link href="/#how-it-works" className="hover:text-foreground">How it works</Link></li>
              <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground">Questions</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Account</p>
            <ul className="mt-3 space-y-2 text-subtle">
              <li><Link href="/sign-up" className="hover:text-foreground">Create account</Link></li>
              <li><Link href="/sign-in" className="hover:text-foreground">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Open source</p>
            <ul className="mt-3 space-y-2 text-subtle">
              <li><a href="https://github.com/roobiwebdev/Sumz-AI" className="hover:text-foreground" target="_blank" rel="noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl text-xs text-subtle">© {new Date().getFullYear()} Sumz AI. Built by Roobi.</p>
    </footer>
  );
}
