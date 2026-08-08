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
      className={cn("group/tabs w-full flex flex-col gap-6", className)}
      {...props} />
  );
}

const tabsListVariants = cva(
  "group/tabs-list w-full flex flex-wrap md:flex-nowrap items-center gap-2 p-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-xl overflow-x-auto no-scrollbar scrollbar-none",
  {
    variants: {
      variant: {
        default: "bg-zinc-900/90 border border-zinc-800 shadow-xl",
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
        "relative inline-flex flex-1 min-w-[130px] items-center justify-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs lg:text-sm font-bold whitespace-nowrap transition-all duration-200 outline-none cursor-pointer border border-transparent select-none text-zinc-400 hover:text-white hover:bg-zinc-800/80 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-[active]:bg-gradient-to-r data-[active]:from-blue-600 data-[active]:to-indigo-600 data-[active]:text-white data-[active]:shadow-lg data-[active]:shadow-blue-600/30 data-[active]:border-blue-400/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg aria-selected:bg-blue-600 aria-selected:text-white",
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
