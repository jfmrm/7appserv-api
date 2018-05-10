import { Pool } from 'config';
import { Customer, Place, ServiceType, Pro, ProVIP, Address, City } from 'models';
import { getPic } from '../routes/helpers';

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
    return Pool.query('INSERT INTO demand (customer_id, place_id, service_type_id, details, is_public, pro_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [this.customer.id, this.place.id, this.serviceType.id, this.details, this.isPublic, this.pro, this.dueDate])
      .then((results) => {
        this.id = results.insertId;
        return Pool.query('UPDATE service_type SET reference_counter = reference_counter + 1 WHERE id = ?', this.serviceType.id)
      }).then(() => {
          return this.get('id', this.id)
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM demand WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new Demand(results[0].customer_id, results[0].place_id, results[0].service_type_id, results[0].due_date, results[0].details, results[0].is_public, results[0].pro_id, results[0].is_open, results[0].last_modified, results[0].id)
      }).then((demand) => {
        if(demand.isPublic) { //if demand is public it wont try to get a pro
          return Promise.all([
            new Customer().get('id', demand.customer),
            new Place().get('id', demand.place),
            ServiceType.get('id', demand.serviceType),
          ]).then((res) => {
            demand.customer = res[0]
            demand.place = res[1]
            demand.serviceType = res[2]
            return demand
          })
        } else { //if the demand is private it will try to get its pro
          return Promise.all([
            new Customer().get('id', demand.customer),
            new Place().get('id', demand.place),
            ServiceType.get('id', demand.serviceType),
            new ProVIP().get('pro_id', demand.pro)
          ]).then((res) => {
            demand.customer = res[0]
            demand.place = res[1]
            demand.serviceType = res[2]
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
      Pool.query('UPDATE demand SET place_id = ?, service_type_id = ?, details = ?, due_date = ? WHERE id = ?',
        [this.place.id, this.serviceType.id, this.details, this.dueDate, this.id]),
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

  getPublicDemandList(cityId) {
      return Pool.query(`SELECT customer.first_name as customer_first_name,
                          customer.last_name as customer_last_name,
                          address.address_line, address.latitude, address.longitude,
                          demand.due_date,
                          service_type.type as service_type,
                          demand.id
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
            dueDate: demandListItem.due_date,
            serviceType: demandListItem.service_type,
            id: demandListItem.id
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

  static hasQuoted(proId, demandId) {
    return Pool.query('SELECT value FROM quotation WHERE pro_id = ? AND demand_id = ?', [proId, demandId])
      .then((results) => {
        if (results[0]) {
          return results[0].value
        } else {
          return false
        }
      }).catch((error) => {
        throw error
      })
  }
}
