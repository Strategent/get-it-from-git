import { useState } from "react";
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
  Search,
  Mic,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Folder,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const nav = [
  { title: "Home", url: "/", icon: HomeIcon },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Calls", url: "/calls", icon: Phone },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Channels", url: "/channels", icon: Hash },
  { title: "Team", url: "/team", icon: UserCog },
  { title: "Connectors", url: "/connectors", icon: Plug },
  { title: "Syra", url: "/syra", icon: Sparkles },
];

const secondary = [
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Support", url: "/support", icon: LifeBuoy },
  { title: "Settings", url: "/settings", icon: Settings },
];

const files = [
  { title: "SOP", url: "/documents" },
  { title: "Company", url: "/documents" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [filesOpen, setFilesOpen] = useState(true);
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const renderItems = (
    items: { title: string; url: string; icon?: typeof HomeIcon }[],
  ) => (
    <SidebarMenu className="gap-0.5">
      {items.map((item) => {
        const active = isActive(item.url);
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.title}
              className={`h-10 rounded-[10px] transition-colors duration-150 ${
                collapsed ? "justify-center px-0 [&>a]:justify-center" : "px-3"
              } ${
                active
                  ? "border border-border/70 bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.08]"
                  : "border border-transparent text-muted-foreground/80 hover:text-foreground hover:bg-foreground/[0.04]"
              }`}
            >
              <Link
                to={item.url}
                className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3"}`}
              >
                {item.icon && (
                  <item.icon
                    strokeWidth={1.6}
                    className="h-[18px] w-[18px] shrink-0"
                  />
                )}
                {!collapsed && (
                  <span className="font-dm-sans text-[14px] tracking-tight">
                    {item.title}
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border/60 bg-sidebar">
      <SidebarHeader className="px-4 pt-5 pb-3">
        {!collapsed && (
          <div className="font-dm-sans text-[22px] font-medium tracking-tight text-foreground">
            strategent
          </div>
        )}
        <div className="mt-4">
          <label
            className={`flex items-center rounded-[12px] border border-border/70 bg-foreground/[0.03] ${
              collapsed ? "justify-center h-10 w-10" : "gap-2.5 px-3 h-11"
            }`}
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground/70" strokeWidth={1.7} />
            {!collapsed && (
              <>
                <input
                  type="search"
                  placeholder="Search"
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none"
                />
                <Mic className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={1.7} />
              </>
            )}
          </label>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="py-1">
          <SidebarGroupContent>{renderItems(nav)}</SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup className="py-1">
            <div className="flex items-center gap-1 px-3 py-1.5 text-muted-foreground/70">
              <button
                type="button"
                onClick={() => setFilesOpen((v) => !v)}
                className="flex flex-1 items-center gap-2 text-left hover:text-foreground transition-colors"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${filesOpen ? "" : "-rotate-90"}`}
                  strokeWidth={1.7}
                />
                <span className="font-dm-sans text-[14px] tracking-tight">File</span>
              </button>
              <Plus className="h-4 w-4 opacity-70" strokeWidth={1.7} />
              <MoreHorizontal className="h-4 w-4 opacity-70" strokeWidth={1.7} />
            </div>
            {filesOpen && (
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {files.map((f) => (
                    <SidebarMenuItem key={f.title}>
                      <SidebarMenuButton
                        asChild
                        className="h-10 rounded-[10px] px-3 border border-transparent text-muted-foreground/80 hover:text-foreground hover:bg-foreground/[0.04]"
                      >
                        <Link to={f.url} className="flex items-center gap-3">
                          <Folder className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
                          <span className="font-dm-sans text-[14px] tracking-tight">{f.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto py-2">
          <SidebarGroupContent>{renderItems(secondary)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

