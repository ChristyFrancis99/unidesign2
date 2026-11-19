import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UnI Design Group | Architecture & Interiors in Pune" },
      {
        name: "description",
        content:
          "Thoughtful architecture, interior design and visualisation shaped around people, purpose and detail. Based in Pune, India.",
      },
      {
        property: "og:title",
        content: "UnI Design Group | Architecture & Interiors in Pune",
      },
      {
        property: "og:description",
        content:
          "Thoughtful architecture, interior design and visualisation shaped around people, purpose and detail. Based in Pune, India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="studio-frame">
      <iframe
        className="studio-frame__page"
        src="/uni-design/index.html"
        title="UnI Design Group — architecture, interior and visualisation studio"
      />
    </main>
  );
}
