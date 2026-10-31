import { useEffect } from "react";

/** Load the public embed after hydration and keep it mounted across SPA navigation. */
export function ObseriWidget() {
  useEffect(() => {
    if (document.getElementById("flamki-obseri-widget")) return;

    const script = document.createElement("script");
    script.id = "flamki-obseri-widget";
    script.src = "https://obseri.com/obseri-widget.js";
    script.async = true;
    script.dataset.soulId = "245b3f12-6ecb-4fb1-9095-36017303f7b5";
    // Public, domain-restricted embed token; never use a publish key here.
    script.dataset.widgetToken =
      "obswgt_7b6997ee7fc7210b861d3057199d368bf92ab26b4bd473b565043f39cd0a522d";
    script.dataset.position = "bottom-right";
    script.dataset.accent = "#b6ff60";
    script.dataset.analytics = "on";
    script.dataset.proactive = "on";
    script.dataset.consent = "not-required";
    document.body.appendChild(script);
    // The embed owns its DOM and listeners for the page lifetime. Retaining the
    // script prevents duplicate launchers during Strict Mode or route changes.
  }, []);

  return null;
}
