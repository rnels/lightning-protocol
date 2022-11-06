import * as api from '../lib/api';
import { Pool } from '../lib/types';
import UserPoolDetails from '../components/Pool/UserPoolDetails';

import { useEffect, useState } from 'react';
import React from 'react';
import { GetServerSideProps } from 'next';

/** Renders a list of pools for the logged in user */
export default function UserPools(props: { poolList: Pool[] }) {

  return (
    <div className='user-pools-page'>
      <h2>My Pools</h2>
      {props.poolList.length > 0 &&
        props.poolList.map((pool) =>
          <UserPoolDetails
            pool={pool}
            key={pool.poolId}
          />
        )
      }
    </div>
  );

};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let poolList = await api.getUserPools();

  return {
    props: {
      poolList
    }
  }

};
