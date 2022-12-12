import * as api from '../../../lib/api';
import { cookies } from 'next/headers';
import React from 'react';
import styles from '../discover.module.scss';
import ContractTypeDetails from '../../contracts/ContractTypeDetails';

// TODO: This will be the page where users are recommended contracts based on their sentiment
export default async function BadgedTypeResults(props: {assetId: string | number, direction: boolean}) {

  const contractTypes = await getBadgedContractTypes(props.assetId, props.direction);

  return (
    <div>
      {contractTypes.map((contractType) =>
        <ContractTypeDetails
          contractType={contractType}
        />
      )}
    </div>
  );

}


async function getBadgedContractTypes(assetId: string | number, direction: boolean) {
  let cookie = cookies().get('lightning-app-cookie');
  let contractTypes = await api.getBadgedContractTypes(assetId, direction, cookie!.value);
  return contractTypes;
}


