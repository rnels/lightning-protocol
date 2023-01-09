// import { errorMessage as errorMessageStyle } from '../styles.module.scss';
// import styles from '../../styles.module.scss';
import * as api from '../../../lib/api_client';
import { PoolLock, Pool } from '../../../lib/types';
import PoolLockDetails from './PoolLockDetails';

/** Renders a list of pools locks for the provided pool */
// TODO: Use this somewhere
export default async function PoolLockList(props: { pool: Pool }) {

  if (!props.pool) return null;

  const poolLockList = await getPoolLocks(props.pool.poolId);

  return (
    <div className='pool-lock-list'>
      <h4>Locks</h4>
      {poolLockList.length > 0 ?
        poolLockList.map((poolLock) =>
          <PoolLockDetails
            poolLock={poolLock}
            key={poolLock.poolLockId}
          />
        )
        :
        <p>There are no pool locks for this asset</p>
      }
    </div>
  );

}

function getPoolLocks(poolId: string | number): Promise<PoolLock[]> {
  return api.getPoolLocksByPoolId(poolId)
    .catch(() => []);
}
