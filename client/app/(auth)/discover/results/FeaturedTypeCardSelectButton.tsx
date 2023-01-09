'use client';

import React from 'react';
import styles from './results.module.scss';
import { ContractType } from '../../../../lib/types';
import useSWR from 'swr';

export default function FeaturedTypeCardSelectButton(props: {contractType: ContractType}) {

  const { data, mutate } = useSWR(props.contractType.contractTypeId.toString());

  function handleClick() {
    if (!data) {
      mutate(
        true // update key data to `true`
      );
    } else {
      mutate(
        false // update key data to `false`
      );
    }
  }

  return (
    <button
      onClick={(e) => handleClick()}
      id={data ? styles.featuredCardSelectButtonSelected : styles.featuredCardSelectButton}
    >
      {data ? 'Selected' : 'Select'}
    </button>
  );

}

// export default function FeaturedTypeCardSelectButton(props: {contractType: ContractType}) {

//   const { cache, mutate } = useSWRConfig();
//   const data = cache.get(props.contractType.contractTypeId.toString());
//   function handleClick() {
//     console.log(data);
//     if (!data) {
//       mutate(
//         props.contractType.contractTypeId.toString(),
//         true // update cache data to `true`
//       );
//     } else {
//       mutate(
//         props.contractType.contractTypeId.toString(),
//         false // update cache data to `false`
//       );
//     }
//   }

//   console.log('reeee');

//   return (
//     <button
//       onClick={(e) => handleClick()}
//       id={data ? styles.featuredCardSelectButtonSelected : styles.featuredCardSelectButton}
//     >
//       {data ? 'Selected' : 'Select'}
//     </button>
//   );

// }

// export default function FeaturedTypeCardSelectButton(props: {contractType: ContractType}) {

//   const [selected, setSelected] = useState<boolean>(false);
//   const { cache, mutate, ...extraConfig } = useSWRConfig();

//   console.log('render');

//   useEffect(() => {
//     if (cache.get(props.contractType.contractTypeId.toString())) setSelected(true);
//   }, []);

//   function handleClick() {
//     if (!selected) {
//       mutate(
//         props.contractType.contractTypeId.toString(), // which cache keys are updated
//         props.contractType // update cache data to `contractType`
//       );
//       setSelected(true);
//     } else {
//       mutate(
//         props.contractType.contractTypeId.toString(), // which cache keys are updated
//         undefined // update cache data to `undefined`
//       );
//       setSelected(false);
//     }
//   }

//   return (
//     <button
//       onClick={(e) => handleClick()}
//       id={selected ? styles.featuredCardSelectButtonSelected : styles.featuredCardSelectButton}
//     >
//       {selected ? 'Selected' : 'Select'}
//     </button>
//   );

// }
