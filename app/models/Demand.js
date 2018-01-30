import { Pool } from '../../config';
import { Costumer, Place, ServiceType, Pro } from './';

export class Demand {
  constructor(costumer, place, serviceType, dueDate, details, isPublic, pro, isOpen, lastModified, demandId) {
    this.id = demandId;
    this.costumer = costumer;
    this.place = place;
    this.serviceType = serviceType;
    this.dueDate = dueDate;
    this.details = details;
    this.isOpen = isOpen;
    this.lastModified = lastModified;
    this.isPublic = isPublic;
    this.pro = pro;

  }

  create() {
    console.log(this.dueDate)
    return Pool.query('INSERT INTO demand (costumer_id, place_id, service_type_id, details, is_public) VALUES (?, ?, ?, ?, ?)',
    [this.costumer.id, this.place.id, this.serviceType.id, this.details, this.isPublic])
      .then((results) => {
        return Promise.all(this.dueDate.map((dueDate) => {
          Pool.query('INSERT INTO demand_due_date (demand_id, start, end) VALUES (?, ?, ?)', [results.insertId, dueDate[0], dueDate[1]])
        })).then(() => {
          return this.get('id', results.insertId)
        })
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM demand WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new Demand(results[0].costumer_id, results[0].place_id, results[0].service_type_id, null, results[0].details, results[0].is_public, results[0].pro_id, results[0].is_open, results[0].last_modified, results[0].id)
      }).then((demand) => {
        return Promise.all([
          new Costumer().get('id', demand.costumer),
          new Place().get('id', demand.place),
          new ServiceType().get('id', demand.serviceType),
          demand.getDueDateList()
        ]).then((res) => {
          demand.costumer = res[0]
          demand.place = res[1]
          demand.serviceType = res[2]
          demand.dueDate = res[3]
          return demand
        })
      }).then((demand) => {
        return demand
      }).catch((error) => {
        //throw new Error('This demand does not exists, or has been deleted')
        throw error
      });
  }

  update() {
    return Promise.all([
      Pool.query('UPDATE demand SET place_id = ?, service_type_id = ?, details = ? WHERE id = ?',
        [this.place.id, this.serviceType.id, this.details, this.id]),
      this.updateDueDateList()
    ]).then((restuls) => {
      return this.get('id', this.id)
    }).catch((error) => {
      throw error
    });
  }

  remove() {
    return Pool.query('DELETE FROM demand WHERE id = ?', [this.id])
      .then((res) => {
        if (res.affectedRows == 1) {
          return this.removeDueDateList()
            .then((res) => {
              if (res == true) {
                return true
              }
            })
        } else {
          throw new Error('Demand does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }

  getDueDateList(){
    return Pool.query('SELECT start, end FROM demand_due_date WHERE demand_id = ?', [this.id])
      .then((results) => {
        return Promise.all(results, (result) => {
          return [result.start, result.end]
        })
      }).then((res) => {
        return Promise.all(res.map((dueDate) => {
          return [dueDate.start, dueDate.end]
        }))
      }).catch((error) => {
        throw error
      });
  }

  updateDueDateList() {
    return Pool.query('DELETE FROM demand_due_date WHERE demand_id = ?', [this.id])
      .then(() => {
        return Promise.all(this.dueDate.map((dueDate) => {
          Pool.query('INSERT INTO demand_due_date (demand_id, start, end) VALUES (?, ?, ?)', [this.id, dueDate[0], dueDate[1]])
        }))
      }).catch((error) => {
        throw error
      })
  }

  removeDueDateList() {
    return Pool.query('DELETE FROM demand_due_date WHERE demand_id = ?', this.id)
      .then((res) => {
        if (res.affectedRows >= 1) {
          return true
        } else {
          throw new Error('Due Date list does not exists on this demand')
        }
      }).catch((error) => {
        throw error
      });
  }
}
