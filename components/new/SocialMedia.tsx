import { Facebook, Github, Linkedin, Slack, Youtube } from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
}

const socialLink = [
  {
    title: "Youtube",
    icon: <Youtube className="w-5 h-5" />,
  },
  {
    title: "Github",
    icon: <Github className="w-5 h-5" />,
  },
  {
    title: "Linkedin",
    icon: <Linkedin className="w-5 h-5" />,
  },
  {
    title: "Facebook",
    icon: <Facebook className="w-5 h-5" />,
  },
  {
    title: "Slack",
    icon: <Slack className="w-5 h-5" />,
  },
];

const SocialMedia = ({ className, iconClassName, tooltipClassName }: Props) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3.5 text-zinc-400", className)}>
        {socialLink.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "p-2 border rounded-full cursor-default hover:text-white hover:border-white hoverEffect",
                  iconClassName
                )}
              >
                {item.icon}
              </div>
            </TooltipTrigger>
            <TooltipContent
              className={cn(
                "bg-white text-darkColor font-semibold",
                tooltipClassName
              )}
            >
              {item.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default SocialMedia;
