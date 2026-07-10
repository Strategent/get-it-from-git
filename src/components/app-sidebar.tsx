import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home as HomeIcon,
  Inbox,
  Phone,
  Users,
  CheckSquare,
  UserCog,
  Hash,
  CreditCard,
  FileText,
  Settings,
  CalendarDays,
  Plug,
  LifeBuoy,
  
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import syraSidebarIcon from "@/assets/sidebar-icon.png.asset.json";
const johnHarwickAvatar = { url: "/john-harwick.png" };
const syraSIcon = { url: "/syra-s.png" };

const SyraIcon = ({ className }: { className?: string; strokeWidth?: number }) => (
  <span aria-hidden className={`relative inline-grid place-items-center overflow-hidden ${className ?? ""}`}>
    <img
      src={syraSIcon.url}
      alt=""
      className="absolute h-full w-full object-contain scale-[3.4] [filter:brightness(0)] dark:[filter:brightness(0)_invert(1)]"
    />

  </span>
);

const workspace = [
  { title: "Home", url: "/", icon: HomeIcon },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Calls", url: "/calls", icon: Phone },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Connectors", url: "/connectors", icon: Plug },
];

const collaboration = [
  { title: "Team", url: "/team", icon: UserCog },
  { title: "Channels", url: "/channels", icon: Hash },
];

const operations = [
  { title: "Syra", url: "/syra", icon: SyraIcon as never, accent: true },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Support", url: "/support", icon: LifeBuoy },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const renderGroup = (
    label: string,
    items: { title: string; url: string; icon: typeof HomeIcon; accent?: boolean }[],
  ) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="font-sans text-[10px] uppercase tracking-[0.06em] text-muted-foreground/45 px-2">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className={`h-9 rounded-lg transition-all ${
                    collapsed ? "justify-center px-0 [&>a]:justify-center" : ""
                  } ${
                    active
                      ? "bg-foreground/[0.07] text-foreground border border-border"
                      : "text-muted-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] border border-transparent"
                  }`}
                >
                  <Link
                    to={item.url}
                    className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-2.5"}`}
                  >
                    <item.icon strokeWidth={1.5} className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && (
                      <span className="text-[13px] font-medium tracking-tight">{item.title}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-border/60 bg-sidebar/80 backdrop-blur-xl"
    >
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="px-1 pb-3 font-sans text-[11px] uppercase tracking-[0.04em] text-muted-foreground/80">
            Harwick & Sterne
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-border bg-foreground/[0.06]">
            <img
              src={johnHarwickAvatar.url}
              alt="John Harwick"
              className="h-full w-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-medium tracking-tight truncate">John Harwick</div>
              <div className="text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground truncate font-sans">
                Partner
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {renderGroup("Workspace", workspace)}
        {renderGroup("Collaboration", collaboration)}
        {renderGroup("Operations", operations)}
      </SidebarContent>
      <SidebarFooter className="px-5 pb-7 pt-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-7 group-data-[collapsible=icon]:pt-3">
        {!collapsed ? (
          <div className="flex flex-col items-start gap-1.5">
            <span className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground/55">
              Powered by
            </span>
            <span className="font-sans text-[23px] font-light leading-none text-neutral-400/80">strategent</span>
          </div>
        ) : (
          <div className="flex w-full flex-col items-start gap-0.5 pl-[7px]">
            <span className="font-sans text-[3px] uppercase leading-none tracking-[0.02em] text-muted-foreground/55">
              Powered by
            </span>
            <span className="font-sans text-[7px] font-light leading-none text-neutral-400/80">strategent</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
