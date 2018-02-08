import { Pool } from '../../config';
import { Costumer, Place, ServiceType, Pro, ProVIP, Address, City } from './';

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
    return Pool.query('INSERT INTO demand (costumer_id, place_id, service_type_id, details, is_public, pro_id) VALUES (?, ?, ?, ?, ?, ?)',
    [this.costumer.id, this.place.id, this.serviceType.id, this.details, this.isPublic, this.pro])
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
        if(demand.isPublic) { //if demand is public it wont try to get a pro
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
        } else { //if the demand is private it will try to get its pro
          return Promise.all([
            new Costumer().get('id', demand.costumer),
            new Place().get('id', demand.place),
            new ServiceType().get('id', demand.serviceType),
            demand.getDueDateList(),
            new ProVIP().get('pro_id', demand.pro)
          ]).then((res) => {
            demand.costumer = res[0]
            demand.place = res[1]
            demand.serviceType = res[2]
            demand.dueDate = res[3]
            demand.pro = res[4]
            return demand
          })
        }
      }).then((demand) => {
        return demand
      }).catch((error) => {
        throw new Error('This demand does not exists, or has been deleted')
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

  getPublicDemandList(cityId) {
      return Pool.query(`SELECT costumer.first_name as costumer_first_name,
                          costumer.last_name as costumer_last_name,
                          address.address_line, address.latitude, address.longitude,
                          demand.last_modified,
                          service_type.type as service_type
                        FROM demand
                        INNER JOIN costumer ON costumer.id = demand.costumer_id
                        INNER JOIN place ON place.id = demand.place_id
                        INNER JOIN address ON address.id = place.address_id
                        INNER JOIN city ON city.id = address.city_id
                        INNER JOIN service_type ON service_type.id = demand.service_type_id
                        WHERE city.id = ?`, [cityId])
      .then((results) => {
        return results.map((demandListItem) => {
          return { 
            costumerFirstName: demandListItem.costumer_first_name,
            costumerLastName: demandListItem.costumer_last_name,
            addressLine: demandListItem.address_line,
            latitude: demandListItem.latitude,
            longitude: demandListItem.longitude,
            lastModified: demandListItem.last_modified,
            serviceType: demandListItem.service_type
          }
        })
      }).catch((error) => {
        throw error
      });
  }
}
