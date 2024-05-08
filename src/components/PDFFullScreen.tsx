import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { useToast } from "./ui/use-toast";
import { Page, Document } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";

interface PDFFullScreenProps {
  fileUrl: string;
}

const PDFFullScreen = ({ fileUrl }: PDFFullScreenProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number>();

  const { width, ref } = useResizeDetector();

  return (
    <Dialog
      open={isFullScreen}
      onOpenChange={(v) => {
        setIsFullScreen(v);
      }}
    >
      <DialogTrigger
        asChild
        onClick={() => {
          setIsFullScreen(true);
        }}
      >
        <Button aria-label='fullscreen' variant='ghost' className='gap-1.5'>
          <Expand className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-7xl w-full'>
        <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)] mt-6'>
          <div ref={ref}>
            <Document
              loading={
                <div className='flex justify-center'>
                  <Loader2 className='h-8 w-8 animate-spin my-24' />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={fileUrl}
              className='max-h-full'
            >
              {new Array(numPages).fill(0).map((_, i) => (
                <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PDFFullScreen;
