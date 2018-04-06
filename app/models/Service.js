import { Pool } from 'config';
import { Demand, Pro } from 'models';

export class Service extends Demand {
  constructor(demand, pro, value, isGoing, isDone, doneTime, started, startTime, serviceId) {
    super(demand.customer, demand.place, demand.serviceType, demand.dueDate, demand.details, demand.isPublic, demand.pro, demand.isOpen, demand.lastModified, demand.id);
    this.serviceId = serviceId;
    this.pro = pro;
    this.value = value;
    this.isGoing = isGoing;
    this.isDone = isDone;
    this.doneTime = doneTime;
    this.serviceId = serviceId;
    this.started = started;
    this.startTime = startTime;
  }

  create() {
    return Pool.query('INSERT INTO service (demand_id, pro_id) VALUES (?, ?)', [this.id, this.pro])
      .then((results) => {
        return Service.get('id', results.insertId)
      }).catch((error) => {
        throw error
      });
  }

  static get(column, param) {
    return Pool.query('SELECT * FROM service WHERE ' + column + ' = ?', [param])
      .then((results) => {
        let p = Promise.all([
          new Demand().get('id', results[0].demand_id),
          new Pro().get('id', results[0].pro_id),
          Pool.query('SELECT value FROM quotation WHERE demand_id = ?', [results[0].demand_id])
        ])
        return {results: results, p: p}
      }).then(({results, p}) => {
        return p.then((data) => {
          return new Service(data[0], data[1], data[2][0].value, results[0].is_going, results[0].is_done, results[0].done_time, results[0].started, results[0].start_time, results[0].id)
        })
      }).catch((error) => {
        throw error
      })
  }

  update() {
    //not tested yet
    return Pool.query('UPDATE service SET demand_id = ?, pro_id = ?', [this.demand_id, this.pro_id])
      .then((results) => {
        return Service.get('id', this.serviceId)
      }).catch((error) => {
        throw error
      });
  }

  remove() {
    return Pool.query('DELETE FROM service WHERE id = ?', [this.serviceId])
      .then((res) => {
        if (res.affectedRows == 1) {
          return true
        } else {
          throw new Error('Service does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }

  static going(serviceId) {
    return Pool.query('UPDATE service SET is_going = true WHERE id = ?', [serviceId])
      .then((res) => {
        if(res.affectedRows == 1) {
          return true
        } else {
          throw new Error('Can not update this service status')
        }
      }).catch((error) => {
        throw error
      });
  }

  static startService(serviceId) {
    return Pool.query('UPDATE service SET started = true WHERE id = ?', [serviceId])
      .then((restults) => {
        return Pool.query('SELECT start_time FROM service WHERE id = ?', [serviceId])
      }).then((results) => {
        let startTime = results[0].start_time
        return { startTime }
      }).catch((error) => {
        throw error
      });
  }

  static finishService(serviceId) {
    return Pool.query('UPDATE service SET is_done = true WHERE id = ?', [serviceId])
      .then((res) => {
        return Pool.query('SELECT done_time FROM service WHERE id = ?', [serviceId])
      }).then((results) => {
        let doneTime = results[0].done_time
        return { doneTime }
      }).catch((error) => {
        throw error
      });
  }

  static listServices(proId, dueDate) {
    return Pool.query(`SELECT service.id, customer.first_name, customer.last_name, service_type.type 
                       FROM demand
                       INNER JOIN service ON demand.id = service.demand_id
                       INNER JOIN service_type ON service_type.id = demand.service_type_id
                       INNER JOIN customer ON demand.customer_id = customer.id
                       WHERE demand.due_date = ?`, [dueDate])
      .then((results) => {
        return Promise.all(results.map((serviceListItem) => {
          return {
            serviceId: serviceListItem.id,
            customerFirstName: serviceListItem.first_name,
            customerLastName: serviceListItem.last_name,
            serviceType: serviceListItem.type
          }
        }));
      }).catch((error) => {
        throw error;
      });
  }
}
