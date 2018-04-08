import { Pool } from 'config';

export class City {
  constructor(name, cityId) {
    this.name = name;
    this.id = cityId;
  }

  create() {
    return Pool.query('INSERT INTO city (name) VALUES (?)', [this.name])
      .then((results) => {
        return this.get('id', results.insertId)
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM city WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new City(results[0].name, results[0].id)
      }).catch((error) => {
        throw new Error('City does not exists')
      });
  }

  update() {
    return Pool.query('UPDATE city SET name = ? WHERE id = ?', [this.name ,this.id])
      .then((results) => {
        return this.get('id', this.id)
      }).catch((error) => {
        throw error
      });
  }

  remove() {
    return Pool.query('DELETE FROM city WHERE id = ?', [this.id])
      .then((results) => {
        if (results.affectedRows == 1) {
          return true
        } else {
          throw new Error('City does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }

  static listCities() {
    return Pool.query('SELECT * FROM city')
      .then((results) => {
        return Promise.all(results.map((city) => {
          return new City(results[0].name, results[0].id)
        }))
      }).catch((error) => {
        throw error
      });
  }
}
