import { createFileRoute, redirect } from "@tanstack/react-router";

type LegacyProofSearch = {
  focus?: string;
  guided?: boolean;
};

export const Route = createFileRoute("/proof")({
  validateSearch: (search: Record<string, unknown>): LegacyProofSearch => ({
    focus: typeof search.focus === "string" ? search.focus : undefined,
    guided:
      search.guided === true ||
      search.guided === 1 ||
      search.guided === "1" ||
      search.guided === "true",
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/quick-portfolio",
      search,
      replace: true,
    });
  },
});
