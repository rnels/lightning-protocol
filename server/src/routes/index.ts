import authClient from './client/auth_client';
import authUser from './user/auth_user';
import account from './user/account';
import asset from './client/asset';
import contractClient from './client/contract_client';
import contractUser from './user/contract_user';
import poolClient from './client/pool_client';
import poolUser from './user/pool_user';
import bidClient from './client/bid_client';
import bidUser from './user/bid_user';
import tradeClient from './client/trade_client';
import tradeUser from './user/trade_user';
import groupClient from './client/group_client';
import groupUser from './user/group_user';

export default {
  authClient, // Auth must always come first
  authUser,
  account,
  asset,
  contractClient,
  contractUser,
  poolClient,
  poolUser,
  bidClient,
  bidUser,
  tradeClient,
  tradeUser,
  groupClient,
  groupUser
};
