import { Pool } from 'config';
import { Question } from './';

export class ServiceType {
  constructor(serviceTypeId, type, form) {
    this.id = serviceTypeId;
    this.type = type;
    this.form = form;
  }

  create() {
    return Pool.query('INSERT INTO service_type (type, form) VALUES (?, ?)', [this.type, JSON.stringify(this.form)])
      .then((results) => {
        return this.get('id', results.insertId);
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM service_type WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new ServiceType(results[0].id, results[0].type, JSON.parse(results[0].form))
      }).catch((error) => {
        throw error
      });
  }

  update() {
    return Pool.query('UPDATE service_type SET type = ?, form = ? WHERE id = ?', [this.type, JSON.stringify(this.form), this.id])
      .then((results) => {
        return this.get('id', this.id)
      }).catch((error) => {
        throw error
      });
  }

  remove() {
    return Pool.query('DELETE FROM service_type WHERE id = ?', [this.id])
      .then((res) => {
        if(res.affectedRows == 1) {
          return true
        } else {
          throw new Error('Service type does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }

  static listServiceTypes(){
    return Pool.query('SELECT * FROM service_type')
      .then((results) => {
        return Promise.all(results.map((serviceType) => {
          return new ServiceType(serviceType.id, serviceType.type)
        }))
      }).catch((error) => {
        throw error
      });
  }

  static getForm(serviceTypeId) {
    return Pool.query('SELECT form FROM service_type WHERE id = ?', [serviceTypeId])
      .then((results) => {
        let form = JSON.parse(results[0].form)
        let questions = form.questions
        return Promise.all(questions.map((questionId) => {
          return new Question().get('id', questionId)
        }))
      }).catch((error) => {
        throw error
      });
  }
}
