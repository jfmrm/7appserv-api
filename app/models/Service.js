import { Pool } from 'config';
import { Demand, Pro } from 'models';

export class Service extends Demand {
  constructor(demand, pro, isGoing, isDone, doneTime, started, startTime, serviceId) {
    super(demand.costumer, demand.place, demand.serviceType, demand.dueDate, demand.details, demand.isPublic, demand.pro, demand.isOpen, demand.lastModified, demand.id);
    this.pro = pro;
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
        return this.get('id', results.insertId)
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM service WHERE ' + column + ' = ?', [param])
      .then((results) => {
        let p = Promise.all([new Demand().get('id', results[0].demand_id), new Pro().get('id', results[0].pro_id)])
        return { results: results, p: p }
      }).then(({ results: results, p: p }) => {
        return p.then((res) => {
          //not tested yet
          return new Service(res[0], res[1], results[0].is_going, results[0].is_done, results[0].done_time, results[0].started, results[0].start_time, results[0].id)
        })
      }).catch((error) => {
        throw error
      });
  }

  update() {
    //not tested yet
    return Pool.query('UPDATE service SET demand_id = ?, pro_id = ?', [this.demand_id, this.pro_id])
      .then((results) => {
        return this.get('id', this.serviceId)
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

}
