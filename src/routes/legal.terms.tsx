import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service, NeuraTrace" },
      {
        name: "description",
        content:
          "Terms of Service for NeuraTrace, an educational and emotional support tool for dementia caregivers.",
      },
    ],
  }),
  component: TermsPage,
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

function TermsPage() {
  return (
    <article className="prose-sm max-w-none">
      <h1 className="font-serif text-3xl text-foreground">Terms of Service</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: June 21, 2026</p>

      <Section title="What NeuraTrace is">
        <p>
          NeuraTrace is an educational and emotional support tool designed to help
          families, caregivers, and care teams understand dementia, communicate
          with loved ones, and feel less alone. It provides guides, conversation
          frameworks, and an AI Coach trained for caregiving-related support.
        </p>
      </Section>

      <Section title="What NeuraTrace is not">
        <p>
          NeuraTrace is <strong>not a medical device</strong>. It is not a
          diagnostic tool, does not provide medical advice, and is not a
          substitute for evaluation, treatment, or care from a licensed
          healthcare professional. Always consult a qualified clinician for
          medical decisions.
        </p>
      </Section>

      <Section title="Permitted use">
        <p>
          NeuraTrace is intended for use by family members, informal caregivers,
          and facility staff acting in a supportive capacity. You may use the
          service to learn, reflect, journal, and explore communication
          approaches for people living with dementia.
        </p>
      </Section>

      <Section title="Prohibited use">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Entering Protected Health Information (PHI), patient names, room
            numbers, diagnoses, or any identifying medical details into the AI
            Coach or any input field.
          </li>
          <li>
            Using NeuraTrace for clinical decision-making, triage, medication
            management, or as part of a formal care plan.
          </li>
          <li>
            Accessing accounts that are not your own, attempting to bypass
            authentication, or scraping the service.
          </li>
          <li>
            Using the service for any unlawful purpose or in violation of
            applicable healthcare privacy laws (including HIPAA).
          </li>
        </ul>
      </Section>

      <Section title="Disclaimer of warranties">
        <p>
          NeuraTrace is provided "as is" and "as available", without warranties
          of any kind, whether express or implied, including warranties of
          merchantability, fitness for a particular purpose, accuracy, or
          non-infringement. We do not warrant that the service will be
          uninterrupted, error-free, or that AI-generated content will be
          accurate or appropriate for your situation.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, NeuraTrace and its operators
          shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits, data, or
          goodwill, arising from your use of or inability to use the service -
          even if we have been advised of the possibility of such damages.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These Terms are governed by the laws of the State of Indiana, USA,
          without regard to its conflict-of-laws principles. Any disputes shall
          be resolved in the state or federal courts located in Indiana.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:neuratraceadmin@gmail.com" className="text-primary hover:underline">
            neuratraceadmin@gmail.com
          </a>
          .
        </p>
      </Section>
    </article>
  );
}
