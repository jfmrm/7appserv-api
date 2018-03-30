import { User, Place } from 'models';
import { Pool } from 'config';

export class Customer extends User {
  constructor (firstName, lastName, email, password = null, birthDate, places = [], customerId) {
    super(firstName, lastName, email, password, birthDate);
    this.places = places;
    this.id = customerId;
  }

  create() {
    return Pool.query('INSERT INTO customer (email, first_name, last_name, password, birth_date) VALUES (?, ?, ?, ?, ?)',
    [this.email, this.firstName, this.lastName, this.password, this.birthDate])
      .then((results) => {
        return this.get('id', results.insertId)
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM customer where ' + column + ' = ?', [param])
      .then((results) => {
        return new Customer(results[0].first_name, results[0].last_name, results[0].email, null, results[0].birth_date, null, results[0].id )
      }).then((customer) => {
        return new Place().getListByCustomerId(customer.id)
          .then((places) => {
            return { places: places, customer: customer }
          })
      }).then(({ places: places, customer: customer }) => {
        customer.places = places;
        return customer;
      }).catch((error) => {
        throw error
      });
  }


  update() {
    return Pool.query('UPDATE customer SET email = ?, first_name = ?, last_name = ?, birth_date = ? WHERE email = ?',
    [this.email, this.firstName, this.lastName, this.birthDate, this.email])
      .then((results) => {
        return this.get('email', this.email)
      }).catch((error) => {
        throw error
      });
  }

  remove() {
    return Pool.query('DELETE FROM customer WHERE id = ?', [this.id])
      .then((results) => {
        if(results.affectedRows == 1) {
          return true
        } else {
          throw new Error('Customer does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }

  static listProjects(customerId) {
    return Promise.all([
      Pool.query(`SELECT demand.id as demandId ,service_type.type, service_type.id as serviceTypeId, (demand.standard_quotations + demand.vip_quotations) as offers, demand.last_modified as lastModified FROM demand
                  INNER JOIN service_type ON service_type.id = demand.service_type_id
                  INNER JOIN customer ON customer.id = demand.customer_id
                  WHERE demand.customer_id = ? AND demand.is_open = true
                  GROUP BY demand.id`, [customerId]),
      Pool.query(`SELECT demand.id as demandId, service_type.type, service_type.id as serviceTypeId, demand.last_modified as lastModified, demand.is_open as isOpen FROM demand
                  INNER JOIN service_type ON service_type.id = demand.service_type_id
                  INNER JOIN customer ON customer.id = demand.customer_id
                  WHERE demand.customer_id = ? AND demand.is_open = false
                  GROUP BY demand.id`, [customerId]),
      Pool.query(`SELECT demand.id as demandId, service_type.type, service_type.id as serviceTypeId, demand.last_modified as lastModified, service.done_time as doneTime FROM demand
                  INNER JOIN service_type ON service_type.id = demand.service_type_id
                  INNER JOIN customer ON customer.id = demand.customer_id
                  INNER JOIN service ON service.demand_id = demand.id
                  WHERE demand.customer_id = 13 AND demand.is_open = false AND service.is_done = true
                  GROUP BY demand.id`, [customerId])
    ]).then((data) => {
      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].length; j++) {
          data[i][j].pic = `https://s3.amazonaws.com/7appserv/serviceType/${data[i][j].serviceTypeId}.jpg`
        }
      }
      let projectsList = {
        openDemands: data[0],
        closedDemands: data[1],
        finishedServices: data[2]
      }
      return projectsList
    }).catch((error) => {
      throw error
    });

  }
}
