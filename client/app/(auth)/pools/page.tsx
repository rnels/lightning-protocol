'use client';

import React from 'react';
import UserPoolList from './UserPoolList';
import { getAssetListOwnedExt } from '../../../lib/swr';

export default function UserPoolsPage() {

  const { assets } = getAssetListOwnedExt();

  if (!assets) return null; // NOTE: Ideally I want this to return an error, but pre-flight on build gives me a problem when I do that

  return (
    <div className='user-pools-page'>
      <h2>My Pools</h2>
      <UserPoolList
        assets={assets}
      />
    </div>
  );

}

