import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy, NeuroTrace" },
      {
        name: "description",
        content:
          "How NeuroTrace collects, uses, and protects your data, and your rights as a user.",
      },
    ],
  }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <article className="prose-sm max-w-none">
      <h1 className="font-serif text-3xl text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: June 21, 2026</p>

      <Section title="What data we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account information</strong>, your email address and
            authentication credentials when you create an account.
          </li>
          <li>
            <strong>Usage data</strong>, basic information about how you
            interact with the service (pages visited, features used) used to
            keep the product working reliably.
          </li>
          <li>
            <strong>AI Coach conversations</strong>, for logged-in users, the
            content of Coach conversations is stored so you can return to them.
            Unauthenticated visitors' conversations stay only in their browser.
          </li>
        </ul>
      </Section>

      <Section title="How we use it">
        <p>
          We use your data to operate the service (e.g., signing you in,
          showing your saved conversations), to maintain reliability and
          security, and to improve the product over time. We do not sell your
          data.
        </p>
      </Section>

      <Section title="Third-party processors">
        <p>We rely on a small set of trusted vendors to run NeuroTrace:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong>, database and authentication.
          </li>
          <li>
            <strong>Vercel</strong>, application hosting.
          </li>
          <li>
            <strong>Anthropic</strong>, AI model provider that powers the AI
            Coach.
          </li>
        </ul>
      </Section>

      <Section title="Data retention">
        <p>
          Account data and Coach conversations are retained while your account
          is active. If you delete your account, your data is deleted from our
          active systems within 30 days. Backups may persist for a short
          additional period before being overwritten.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You may request access to, correction of, or deletion of your
          personal data at any time. Email{" "}
          <a href="mailto:neurotraceadmin@gmail.com" className="text-primary hover:underline">
            neurotraceadmin@gmail.com
          </a>{" "}
          and we'll respond within a reasonable timeframe.
        </p>
      </Section>

      <Section title="Children">
        <p>
          NeuroTrace is not intended for users under the age of 13. We do not
          knowingly collect personal information from children under 13. If you
          believe a child has provided us with personal information, please
          contact us so we can remove it.
        </p>
      </Section>

      <Section title="Updates to this policy">
        <p>
          We may update this Privacy Policy from time to time. When we make
          material changes we'll update the "Last updated" date above and, where
          appropriate, notify you in the app or by email.
        </p>
      </Section>
    </article>
  );
}
