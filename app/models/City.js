import { Pool } from '../../config';

export class City {
  constructor(name, cityId) {
    this.name = name;
    this.id = cityId;
  }

  create() {
    return Pool.query('INSERT INTO city (name) VALUES (?)', [this.name])
      .then((results) => {
        return this.get('id', results.insertId)
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM city WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new City(results[0].name, results[0].id)
      });
  }

  update() {
    return Pool.query('UPDATE city SET name = ? WHERE id = ?', [this.name ,this.id])
      .then((results) => {
        return this.get('id', this.id)
      });
  }

  remove() {
    return Pool.query('DELETE FROM city WHERE id = ?', [this.id])
      .then((results) => {
        if (results.affectedRows == 1) {
          return true
        } else {
          return false
        }
      });
  }
}
