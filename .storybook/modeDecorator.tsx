import React from "react";
import { ThemeProvider } from "../registry/blocks/theme-provider";
import { ModeToggle } from "../registry/blocks/mode-toggle";
import { Toaster } from "sonner";
export const ModeDecorator = (Story: any) => {
  return (
    <ThemeProvider>
      <Toaster richColors />
      <StoryContainer Story={Story} />
    </ThemeProvider>
  );
};
const StoryContainer = ({ Story }: { Story: any }) => {
  return (
    <>
      <div className="fixed top-1 right-1 z-9999">
        <ModeToggle />
      </div>
      <Story />
    </>
  );
};
