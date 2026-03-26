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
import { navItems } from '@/config/nav-config';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFilteredNavItems } from '@/hooks/use-nav';
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

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const itemsToShow = useFilteredNavItems(navItems);

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon' variant='inset'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size='lg'
              tooltip={APP_BRAND.name}
              // isActive={pathname === APP_BRAND.homeUrl}
            >
              <Link
                href={APP_BRAND.homeUrl}
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
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {itemsToShow.map((item) => {
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
            })}
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
                  <Link href='/auth/sign-in'>
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
