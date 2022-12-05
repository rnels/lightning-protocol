'use client';

import React, { useEffect, useState } from 'react';
import UserPoolList from './UserPoolList';
import { Asset } from '../../lib/types';

import useSWR from 'swr';
import { getAssetListOwnedExt } from '../../lib/swr';

const { url, fetcher, options } = getAssetListOwnedExt();

console.log('ee');

// TODO: Switch to dynamic rendering. Currently this page uses static rendering on the first visit, and will continue to show the cached page (this affects all pages with server rendering) https://beta.nextjs.org/docs/rendering/static-and-dynamic-rendering

// Actually I think it's always doing dynamic rendering since it needs to get the cookie at request time, it's just not requesting the resource again after navigating away from it. So I think the thing to do is refresh the page on update (like a successful post request)
// So the page fetching must always be dynamic, but I should still be able to cache fetch results from the API(?)

// I could also build some kind of authentication layer on the app where it treats all requests by logged in users the same, like caching at a higher level which doesn't consider the value of the cookie.
export default function UserPoolsPage() {

  const { data, error } = useSWR(url, fetcher, options);
  let assets: Asset[];
  if (error || !data) assets = [];
  else assets = data;

  if (assets.length === 0) return null; // NOTE: Ideally I want this to return an error, but pre-flight on build gives me a problem when I do that

  return (
    <div className='user-pools-page'>
      <h2>My Pools</h2>
      <UserPoolList
        assets={assets}
      />
    </div>
  );

}

