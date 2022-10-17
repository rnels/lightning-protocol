import db from '../db/db';

export function getExample(sort: string, count=10) {
  return db.query(`
    SELECT ${'field'}
      FROM ${'table'}
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
};

export function getByIdExample(id: number) {
  return db.query(`
    SELECT ${'field'}
      FROM ${'table'}
      WHERE id=$1
  `, [id]);
};

export function insertExample(data: {firstValue: any, secondValue: any}) {
  return db.query(`
    INSERT INTO ${'table'} (${'firstField'}, ${'secondField'})
      VALUES ($1, $2)
    RETURNING data_id
  `, [data.firstValue, data.secondValue]);
};

export function updateExample(id: string | number, newData: any) {
  return db.query(`
    UPDATE ${'table'}
      SET ${'field'} = $2
      WHERE id=$1
  `,[id, newData]);
};
