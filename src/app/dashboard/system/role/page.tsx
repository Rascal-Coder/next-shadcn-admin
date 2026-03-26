import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: 角色'
};

const RolePage = () => {
  return (
    <PageContainer
      scrollable
      pageTitle='角色'
      pageDescription='管理系统角色与权限'
    >
      <div className='text-muted-foreground text-sm'>角色配置内容待补充。</div>
    </PageContainer>
  );
};

export default RolePage;
