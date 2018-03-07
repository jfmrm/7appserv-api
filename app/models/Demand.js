import { Pool } from 'config';
import { Customer, Place, ServiceType, Pro, ProVIP, Address, City } from 'models';

export class Demand {
  constructor(customer, place, serviceType, dueDate, details, isPublic, pro, isOpen, lastModified, demandId) {
    this.id = demandId;
    this.customer = customer;
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
    return Pool.query('INSERT INTO demand (customer_id, place_id, service_type_id, details, is_public, pro_id) VALUES (?, ?, ?, ?, ?, ?)',
    [this.customer.id, this.place.id, this.serviceType.id, this.details, this.isPublic, this.pro])
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
        return new Demand(results[0].customer_id, results[0].place_id, results[0].service_type_id, null, results[0].details, results[0].is_public, results[0].pro_id, results[0].is_open, results[0].last_modified, results[0].id)
      }).then((demand) => {
        if(demand.isPublic) { //if demand is public it wont try to get a pro
          return Promise.all([
            new Customer().get('id', demand.customer),
            new Place().get('id', demand.place),
            new ServiceType().get('id', demand.serviceType),
            demand.getDueDateList()
          ]).then((res) => {
            demand.customer = res[0]
            demand.place = res[1]
            demand.serviceType = res[2]
            demand.dueDate = res[3]
            return demand
          })
        } else { //if the demand is private it will try to get its pro
          return Promise.all([
            new Customer().get('id', demand.customer),
            new Place().get('id', demand.place),
            new ServiceType().get('id', demand.serviceType),
            demand.getDueDateList(),
            new ProVIP().get('pro_id', demand.pro)
          ]).then((res) => {
            demand.customer = res[0]
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

  getPublicDemandList(cityId) {
      return Pool.query(`SELECT customer.first_name as customer_first_name,
                          customer.last_name as customer_last_name,
                          address.address_line, address.latitude, address.longitude,
                          demand.last_modified,
                          service_type.type as service_type
                        FROM demand
                        INNER JOIN customer ON customer.id = demand.customer_id
                        INNER JOIN place ON place.id = demand.place_id
                        INNER JOIN address ON address.id = place.address_id
                        INNER JOIN city ON city.id = address.city_id
                        INNER JOIN service_type ON service_type.id = demand.service_type_id
                        WHERE city.id = ? AND is_open = true`, [cityId])
      .then((results) => {
        return results.map((demandListItem) => {
          return { 
            customerFirstName: demandListItem.customer_first_name,
            customerLastName: demandListItem.customer_last_name,
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

  close(demandId) {
    return Pool.query('UPDATE demand SET is_open = false WHERE id = ?', [demandId])
      .then((result) => {
        if (result.affectedRows == 1) {
          return true;
        } else {
          throw new Error('Could not close this demand')
        }
      }).catch((error) => {
        throw error
      });
  }
}
