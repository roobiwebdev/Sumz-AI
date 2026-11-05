import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { CallToAction, Facts, Faq, Features, HowItWorks, SourceStrip } from "@/components/landing/sections";
import { getSession } from "@/server/session";

export default async function HomePage() {
  const signedIn = Boolean(await getSession());
  return (
    <>
      <Nav signedIn={signedIn} />
      <main>
        <Hero signedIn={signedIn} />
        <SourceStrip />
        <HowItWorks />
        <Features />
        <Facts />
        <Faq />
        <CallToAction signedIn={signedIn} />
      </main>
      <Footer />
    </>
  );
}
