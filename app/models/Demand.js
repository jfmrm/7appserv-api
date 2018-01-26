import { Pool } from '../../config';
import { Costumer, Place, ServiceType } from './';

export class Demand {
  constructor(costumer, place, serviceType, dueDate, details, isOpen, lastModified, demandId) {
    this.id = demandId;
    this.costumer = costumer;
    this.place = place;
    this.serviceType = serviceType;
    this.dueDate = dueDate;
    this.details = details;
    this.isOpen = isOpen;
    this.lastModified = lastModified;
  }

  create() {
    return Pool.query('INSERT INTO demand (costumer_id, place_id, service_type_id, due_date, details) VALUES (?, ?, ?, ?, ?)',
    [this.costumer.id, this.place.id, this.serviceType.id, this.dueDate, this.details])
      .then((results) => {
        return this.get('id', results.insertId)
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM demand WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new Demand(results[0].costumer_id, results[0].place_id, results[0].service_type_id, results[0].due_date, results[0].details, results[0].is_open, results[0].last_modified, results[0].id)
      }).then((demand) => {
        return new Costumer().get('id', demand.costumer)
          .then((costumer) => {
            demand.costumer = costumer
            return new Place().get('id', demand.place)
          }).then((place) => {
            demand.place = place
            return new ServiceType().get('id', demand.serviceType)
          }).then((serviceType) => {
            demand.serviceType = serviceType
            return demand
          })
      }).catch((error) => {
        throw new Error('This demand does not exists, or has been deleted')
      });
  }

  update() {
    return Pool.query('UPDATE demand SET place_id = ?, service_type_id = ?, due_date = ?, details = ? WHERE id = ?',
    [this.place.id, this.serviceType.id, this.dueDate, this.details, this.id])
      .then((restuls) => {
        return this.get('id', this.id)
      }).catch((error) => {
        throw error
      });
  }

  remove() {
    return Pool.query('DELETE FROM demand WHERE id = ?', [this.id])
      .then((res) => {
        if (res.affectedRows == 1) {
          return true
        } else {
          return new Error('Demand does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }
}
