import { Pool } from '../../lib/types';
import PoolAssetBuyModal from './PoolAssetBuyModal';
import PoolAssetSellModal from './PoolAssetSellModal';

// modalType:
// true - Deposit
// false - Withdraw
export default function PoolAssetModal(
  props: {
    pool: Pool,
    unlockedAmount: number,
    modalType: boolean,
    onClose: Function,
    onSubmit: Function
  }
) {

  return (
    props.modalType ?
      <PoolAssetBuyModal
        pool={props.pool}
        onClose={props.onClose}
        onSubmit={props.onSubmit}
      />
      :
      <PoolAssetSellModal
        pool={props.pool}
        unlockedAmount={props.unlockedAmount}
        onClose={props.onClose}
        onSubmit={props.onSubmit}
      />
  );

};
