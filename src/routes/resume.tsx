import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Download, ExternalLink, FileText } from "lucide-react";
import GlassSurface from "@/components/GlassSurface";
import { RESUME_URL } from "@/lib/resume";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume - Ayush S. Singh" },
      {
        name: "description",
        content:
          "Preview and download the resume of Ayush S. Singh, full stack developer and systems engineer.",
      },
    ],
  }),
  component: ResumePage,
});

function ResumePage() {
  return (
    <div className="relative h-dvh overflow-hidden bg-background text-foreground">
      <PaintBackdrop />

      <main className="relative z-10 mx-auto grid h-dvh max-w-[1440px] grid-rows-[auto_minmax(0,1fr)] gap-4 px-4 py-4 md:px-8">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <Link to="/" className="glass-button text-sm font-medium text-foreground/80">
            <GlassSurface
              width="auto"
              height={42}
              borderRadius={999}
              backgroundOpacity={0.08}
              saturation={1.7}
              distortionScale={-90}
              contentClassName="gap-2 px-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </GlassSurface>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noreferrer"
              className="glass-button text-sm font-semibold text-foreground/85"
            >
              <GlassSurface
                width="auto"
                height={42}
                borderRadius={999}
                backgroundOpacity={0.08}
                saturation={1.7}
                distortionScale={-90}
                contentClassName="gap-2 px-4"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </GlassSurface>
            </a>

            <a
              href={RESUME_URL}
              download="Ayush_Singh_Resume.pdf"
              className="glass-button text-sm font-semibold text-foreground/90"
            >
              <GlassSurface
                width="auto"
                height={42}
                borderRadius={999}
                backgroundOpacity={0.14}
                saturation={1.9}
                distortionScale={-105}
                redOffset={3}
                greenOffset={10}
                blueOffset={18}
                contentClassName="gap-2 px-4"
              >
                <Download className="h-4 w-4" />
                Download
              </GlassSurface>
            </a>
          </div>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass-strong grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[34px] p-3 md:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-violet-500">
                <FileText className="h-4 w-4" />
                resume
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight md:text-4xl">Ayush S. Singh</h1>
            </div>

            <p className="max-w-xl text-sm font-medium leading-6 text-muted-foreground">
              Preview it inside the app, open it full screen, or download the PDF.
            </p>
          </div>

          <div className="min-h-0 overflow-hidden rounded-[26px] border border-white/55 bg-white/45 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_24px_80px_rgba(20,20,20,0.1)] backdrop-blur-2xl">
            <iframe
              title="Ayush S. Singh resume preview"
              src={`${RESUME_URL}#toolbar=0&navpanes=0&view=FitH`}
              className="h-full w-full rounded-[20px] bg-white"
            />
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function PaintBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="aurora absolute inset-0 opacity-60" />
      <div className="paper-grain absolute inset-0 opacity-20" />
    </div>
  );
}
