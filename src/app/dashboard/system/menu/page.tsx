import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: 菜单'
};

const MenuPage = () => {
  return (
    <PageContainer
      scrollable
      pageTitle='菜单'
      pageDescription='管理系统菜单配置'
    >
      <div className='text-muted-foreground text-sm'>菜单配置内容待补充。</div>
    </PageContainer>
  );
};

export default MenuPage;
