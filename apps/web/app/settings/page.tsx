import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SettingsForm } from "@/components/settings-form";

export const metadata = {
  title: "Settings · Spend It Slow",
};

export default function SettingsPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header showSettings={false} />
      <section className="mx-auto w-full max-w-md flex-1 px-5 py-8">
        <h1 className="mb-6 font-serif text-2xl tracking-tight text-ink">Settings</h1>
        <SettingsForm />
      </section>
      <Footer />
    </main>
  );
}
