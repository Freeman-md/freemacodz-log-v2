import { LayoutDashboard, FileText, CheckSquare, Calendar, Archive, Sun, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const isSunday = new Date().getDay() === 0;

const items = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Weekly Evidence', url: '/evidence', icon: FileText },
  { title: 'Weekly Commitments', url: '/commitments', icon: CheckSquare },
  { title: 'Daily Execution', url: '/daily', icon: Calendar },
  { title: 'Previous Weeks', url: '/previous', icon: Archive },
  ...(isSunday ? [{ title: 'Sunday Planning', url: '/sunday-planning', icon: Sun }] : []),
];

export function AppSidebar() {
  const { signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold tracking-tight">GTV Tracker</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/'} className="hover:bg-muted/50" activeClassName="bg-muted text-foreground font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
