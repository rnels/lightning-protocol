import { Pool } from '../../lib/types';
import PoolAssetDepositModal from './PoolAssetDepositModal';
import PoolAssetWithdrawModal from './PoolAssetWithdrawModal';

// modalType:
// true - Deposit
// false - Withdraw
export default function PoolAssetModal(props: {pool: Pool, modalType: boolean, onClose: Function}) {

  return (
    props.modalType ?
      <PoolAssetDepositModal
        pool={props.pool}
        onClose={props.onClose}
      />
      :
      <PoolAssetWithdrawModal
        pool={props.pool}
        onClose={props.onClose}
      />
  );

};
