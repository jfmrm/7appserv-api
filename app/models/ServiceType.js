import { Pool } from '../../config';

export class ServiceType {
  constructor(serviceTypeId, type) {
    this.id = serviceTypeId;
    this.type = type;
  }

  create() {
    return Pool.query('INSERT INTO service_type (type) VALUES (?)',
    [this.type])
      .then((results) => {
        return this.get('id', results.insertId)
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM service_type WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new ServiceType(results[0].id, results[0].type)
      });
  }

  update() {
    return Pool.query('UPDATE service_type SET type = ? WHERE id = ?', [this.id])
      .then((results) => {
        return this.get('id', this.id)
      });
  }

  remove() {
    return Pool.query('DELETE FROM service_type WHERE id = ?', [this.id])
      .then((res) => {
        if(res.affectedRows == 1) {
          return true
        } else {
          return false
        }
      });
  }
}