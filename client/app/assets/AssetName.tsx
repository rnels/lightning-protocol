import styles from './assets.module.css';

export default function AssetName(props: {name: string}) {

  return (
    <div className={styles.assetName}>
      {props.name}
    </div>
  );

}
