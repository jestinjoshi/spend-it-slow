import { Calculator } from "@/components/calculator";
import { Header } from "@/components/header";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-5 py-10">
        <div className="text-center">
          <h1 className="font-serif text-3xl tracking-tight text-ink">
            What does it really cost?
          </h1>
          <p className="mt-2 text-sm text-muted">
            Enter a price. See it in the hours of work it takes to afford.
          </p>
        </div>
        <Calculator />
      </section>
      <footer className="mx-auto w-full max-w-md px-5 pb-6 text-center text-xs text-faint">
        Free &amp; open source · works offline · spend it slow
      </footer>
    </main>
  );
}
