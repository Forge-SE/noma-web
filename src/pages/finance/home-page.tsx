import * as Avatar from '@/components/ui/avatar';
import Header from '@/components/header';
import { MoveMoneyButton } from '@/components/move-money-button';
import WidgetBudgetOverview from '@/components/widgets/finance/widget-budget-overview';
import WidgetCreditScore from '@/components/widgets/finance/widget-credit-score';
import WidgetExchange from '@/components/widgets/finance/widget-exchange';
import WidgetMajorExpenses from '@/components/widgets/finance/widget-major-expenses';
import WidgetMyCards from '@/components/widgets/finance/widget-my-cards';
import WidgetMyCardsCompact from '@/components/widgets/finance/widget-my-cards-compact';
import WidgetMySubscriptions from '@/components/widgets/finance/widget-my-subscriptions';
import WidgetQuickTransfer from '@/components/widgets/finance/widget-quick-transfer';
import WidgetRecentTransactions from '@/components/widgets/finance/widget-recent-transactions';
import WidgetSavedActions from '@/components/widgets/finance/widget-saved-actions';
import WidgetSpendingSummary from '@/components/widgets/finance/widget-spending-summary';
import WidgetTotalBalance from '@/components/widgets/finance/widget-total-balance';
import WidgetTotalExpenses from '@/components/widgets/finance/widget-total-expenses';
import WidgetTransactionsTable from '@/components/widgets/finance/widget-transactions-table';

export function FinanceHomePage() {
  return (
    <>
      <Header
        icon={
          <Avatar.Root size='48' color='blue'>
            <Avatar.Image src='/images/avatar/illustration/arthur.png' alt='' />
          </Avatar.Root>
        }
        title='Arthur Taylor'
        description='Welcome back to Apex 👋🏻'
      >
        <MoveMoneyButton className='hidden lg:flex' />
      </Header>

      <div className='flex flex-col gap-6 overflow-hidden px-4 pb-6 lg:px-8 lg:pt-1'>
        <div className='mx-auto grid w-full max-w-md grid-cols-1 items-start gap-6 lg:max-w-3xl lg:grid-cols-2 lg:justify-center min-[1300px]:max-w-4xl min-[1400px]:max-w-full min-[1400px]:grid-cols-3'>
          <WidgetMyCards className='lg:row-span-2' />
          <WidgetBudgetOverview className='[grid-column:1/-1] min-[1300px]:col-span-2' />
          <WidgetSpendingSummary />
          <WidgetExchange />
          <WidgetMyCardsCompact />
          <div className='grid gap-6'>
            <WidgetTotalExpenses />
            <WidgetTotalBalance />
          </div>
          <WidgetQuickTransfer />
          <WidgetRecentTransactions />
          <WidgetMySubscriptions />
          <WidgetSavedActions />
          <WidgetCreditScore />
          <WidgetMajorExpenses />
          <WidgetTransactionsTable className='[grid-column:1/-1]' />
        </div>
      </div>
    </>
  );
}
