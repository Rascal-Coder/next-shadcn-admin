'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { useDashboardMenu } from '@/components/layout/dashboard-menu-provider';
import { navItems } from '@/config/nav-config';
import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import { useFilteredNavItems } from '@/hooks/use-nav';
import {
  menuNodeMatchesPathname,
  menuSubtreeHasActivePath,
  resolveMenuIconKey
} from '@/lib/menu-tree-nav';
import { normalizeMenuRoutePath } from '@/lib/menu-access';
import { clearAuthStorage } from '@/lib/auth-storage';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  IconChevronRight,
  IconChevronsDown,
  IconLogout
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';

const APP_BRAND = {
  name: 'Next Shadcn',
  tagline: 'Dashboard',
  homeUrl: '/dashboard/overview'
} as const;

/** `public/assets/avatar.png` — URL 从 public 根路径解析 */
const USER_AVATAR_SRC = '/assets/avatar.png';

const USER_MENU = {
  name: 'qi yuhang',
  email: 'meno.qiqio@gmail.com',
  initials: 'qy'
} as const;

function MenuTreeSidebarItems({
  nodes,
  pathname,
  nested = false
}: {
  nodes: MenuTreeNodeView[];
  pathname: string;
  nested?: boolean;
}) {
  return (
    <>
      {nodes.map((node) => {
        if (node.menuType === 'BUTTON') return null;

        const iconKey = resolveMenuIconKey(node.icon);
        const Icon = iconKey ? Icons[iconKey] : Icons.logo;
        const childList = node.children ?? [];
        const hasChildren = childList.length > 0;
        const href = normalizeMenuRoutePath(node.path);

        if (hasChildren) {
          const defaultOpen = menuSubtreeHasActivePath(pathname, node);
          const triggerActive = menuSubtreeHasActivePath(pathname, node);

          if (!nested) {
            return (
              <Collapsible
                key={node.id}
                asChild
                defaultOpen={defaultOpen}
                className='group/collapsible'
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={node.name}
                      isActive={triggerActive}
                    >
                      <Icon className='size-4' />
                      <span>{node.name}</span>
                      <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <MenuTreeSidebarItems
                        nodes={childList}
                        pathname={pathname}
                        nested
                      />
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuSubItem key={node.id}>
              <Collapsible
                defaultOpen={defaultOpen}
                className='group/collapsible w-full'
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton isActive={triggerActive}>
                    <span className='truncate'>{node.name}</span>
                    <IconChevronRight className='ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90' />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <MenuTreeSidebarItems
                      nodes={childList}
                      pathname={pathname}
                      nested
                    />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuSubItem>
          );
        }

        if (href) {
          if (!nested) {
            return (
              <SidebarMenuItem key={node.id}>
                <SidebarMenuButton
                  asChild
                  tooltip={node.name}
                  isActive={menuNodeMatchesPathname(pathname, node)}
                >
                  <Link href={href}>
                    <Icon className='size-4' />
                    <span>{node.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuSubItem key={node.id}>
              <SidebarMenuSubButton
                asChild
                isActive={menuNodeMatchesPathname(pathname, node)}
              >
                <Link href={href}>
                  <span>{node.name}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          );
        }

        return null;
      })}
    </>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { bootstrapped, bypassMenuGuard, menuNodesForSidebar, fallbackPath } =
    useDashboardMenu();
  const staticItems = useFilteredNavItems(navItems);
  const showBackendMenu = bootstrapped && menuNodesForSidebar.length > 0;

  const brandHref = bootstrapped ? fallbackPath : APP_BRAND.homeUrl;

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon' variant='inset'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size='lg' tooltip={APP_BRAND.name}>
              <Link
                href={brandHref}
                className='flex min-w-0 items-center gap-2'
              >
                <Image
                  src='/logo.svg'
                  alt=''
                  width={36}
                  height={40}
                  className='size-9 shrink-0 object-contain'
                />
                <div className='grid min-w-0 flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    {APP_BRAND.name}
                  </span>
                  <span className='text-sidebar-foreground/70 truncate text-xs'>
                    {APP_BRAND.tagline}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarMenu>
            {!bootstrapped ? null : showBackendMenu ? (
              <MenuTreeSidebarItems
                nodes={menuNodesForSidebar}
                pathname={pathname}
              />
            ) : bypassMenuGuard ? (
              staticItems.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className='group/collapsible'
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname === item.url}
                        >
                          {item.icon && <Icon />}
                          <span>{item.title}</span>
                          <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })
            ) : (
              <MenuTreeSidebarItems
                nodes={menuNodesForSidebar}
                pathname={pathname}
              />
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  tooltip={USER_MENU.name}
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <Avatar className='size-8 rounded-lg'>
                    <AvatarImage src={USER_AVATAR_SRC} alt={USER_MENU.name} />
                    <AvatarFallback className='rounded-lg text-xs'>
                      {USER_MENU.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid min-w-0 flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {USER_MENU.name}
                    </span>
                    <span className='text-sidebar-foreground/70 truncate text-xs'>
                      {USER_MENU.email}
                    </span>
                  </div>
                  <IconChevronsDown className='ml-auto size-4 shrink-0' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5'>
                    <Avatar className='size-8 rounded-lg'>
                      <AvatarImage src={USER_AVATAR_SRC} alt={USER_MENU.name} />
                      <AvatarFallback className='rounded-lg text-xs'>
                        {USER_MENU.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid min-w-0 flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {USER_MENU.name}
                      </span>
                      <span className='text-muted-foreground truncate text-xs'>
                        {USER_MENU.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/auth/sign-in' onClick={() => clearAuthStorage()}>
                    <IconLogout className='mr-2 size-4' />
                    退出登录
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
