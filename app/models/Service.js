import { Pool } from '../../config';
import { Demand, Pro } from './';

export class Service extends Demand {
  constructor(demand, pro, isGoing, isDone, doneTime, serviceId) {
    super(demand.id, demand.costumer, demand.place, demand.serviceType, demand.dueDate, demand.details, demand.isOpen, demand.lastModified);
    this.pro = pro;
    this.isGoing = isGoing;
    this.isDone = isDone;
    this.doneTime = doneTime;
    this.serviceId = serviceId;
  }

  create() {
    return Pool.query('INSERT INTO service (demand_id, pro_id) VALUES (?, ?)', [this.id, this.pro.id])
      .then((results) => {
        return this.get('id', results.insertId)
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM service WHERE ' + column + ' = ?', [param])
      .then((results) => {
        let p = Promise.all([new Demand().get('id', results[0].demand_id), new Pro().get('id', results[0].pro_id)])
        return { results: results, p: p }
      }).then(({ results: results, p: p }) => {
        return p.then((res) => {
          return new Service(res[0], res[1], results[0].is_going, results[0].is_done, results[0].done_time, results[0].id)
        })
      });
  }

  update() {
    return Pool.query('UPDATE service SET demand_id = ?, pro_id = ?, is_going = ?, isDone = ?, done_time = ?')
      .then((results) => {
        return this.get('id', this.serviceId)
      })
  }

  remove() {
    return Pool.query('DELETE FROM service WHERE id = ?', [this.serviceId])
      .then((res) => {
        if (res.affectedRows == 1) {
          return true
        } else {
          return false
        }
      });
  }

}
