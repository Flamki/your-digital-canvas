import { Download, ExternalLink, FileText } from "lucide-react";
import GlassSurface from "@/components/GlassSurface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const RESUME_URL = "/Ayush_Singh_Resume.pdf";

type ResumeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ResumeDialog({ open, onOpenChange }: ResumeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="resume-dialog glass-strong grid h-[min(86dvh,820px)] w-[min(94vw,980px)] max-w-none grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden rounded-[28px] border-white/50 p-4 shadow-[0_24px_90px_-38px_rgb(0_0_0/0.55)] sm:rounded-[32px] md:p-5">
        <DialogHeader className="pr-10 text-left">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl">
                <FileText className="h-5 w-5 text-chat-user" />
                Ayush S. Singh Resume
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Preview it here, open it full screen, or download the PDF.
              </DialogDescription>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noreferrer"
                className="glass-button text-sm font-semibold text-foreground"
              >
                <GlassSurface
                  width="100%"
                  height={42}
                  borderRadius={999}
                  backgroundOpacity={0.1}
                  saturation={1.85}
                  distortionScale={-120}
                  redOffset={4}
                  greenOffset={12}
                  blueOffset={22}
                  contentClassName="gap-2 px-4"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Preview</span>
                </GlassSurface>
              </a>
              <a
                href={RESUME_URL}
                download="Ayush_Singh_Resume.pdf"
                className="glass-button text-sm font-semibold text-foreground"
              >
                <GlassSurface
                  width="100%"
                  height={42}
                  borderRadius={999}
                  backgroundOpacity={0.16}
                  saturation={1.95}
                  distortionScale={-120}
                  redOffset={4}
                  greenOffset={12}
                  blueOffset={22}
                  contentClassName="gap-2 px-4"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </GlassSurface>
              </a>
            </div>
          </div>
        </DialogHeader>

        <div className="resume-preview-shell min-h-0 overflow-hidden rounded-[22px] border border-white/55 bg-white/35 p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.62),0_20px_60px_-40px_rgb(0_0_0/0.55)] backdrop-blur-2xl">
          <iframe
            title="Ayush S. Singh Resume preview"
            src={`${RESUME_URL}#toolbar=0&navpanes=0&view=FitH`}
            className="h-full w-full rounded-[16px] bg-white"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
