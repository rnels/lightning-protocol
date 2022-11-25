import styles from './assets.module.scss';

export default function AssetName(props: {name: string}) {

  return (
    <div className={styles.assetName}>
      {props.name}
    </div>
  );

}
