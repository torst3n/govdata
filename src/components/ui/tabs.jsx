"use client"

import React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2", className)}
      {...props} />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex items-center rounded-2xl p-1.5 text-muted-foreground data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-zinc-900/80 border border-zinc-800 shadow-lg",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function TabsList({
  className,
  variant = "default",
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props} />
  );
}

function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs lg:text-sm font-bold whitespace-nowrap transition-all duration-200 outline-none cursor-pointer border border-transparent select-none text-zinc-400 hover:text-white hover:bg-zinc-800/60 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-[active]:bg-blue-600 data-[active]:text-white data-[active]:shadow-lg data-[active]:shadow-blue-600/30 data-[active]:border-blue-500/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg aria-selected:bg-blue-600 aria-selected:text-white",
        className
      )}
      {...props} />
  );
}

function TabsContent({
  className,
  value,
  ...props
}) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      value={value}
      className={cn("flex-1 text-sm outline-none w-full min-w-0 focus-visible:outline-none", className)}
      {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
