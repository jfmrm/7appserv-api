import { Pool } from 'config';
import { Question } from './';
import {getPic} from '../../app/routes/helpers';

export class ServiceType {
  
  /**
   * Constructor for ServiceType
   * @param {string} type 
   * @param {object} form 
   * @param {number} serviceTypeId 
   * @param {number} referenceCounter 
   */
  constructor(type, form = {}, serviceTypeId = null, referenceCounter = 0) {
    this.id = serviceTypeId
    this.type = type
    this.form = form
    this.referenceCounter = referenceCounter
  }

  create() {
    return Pool.query('INSERT INTO service_type (type, form) VALUES (?, ?)', [this.type, JSON.stringify(this.form)])
      .then((results) => {
        return ServiceType.get('id', results.insertId)
      }).catch((error) => {
        throw error
      });
  }

  /**
   * Return ServiceType based on query
   * @param {string} column representing sql column
   * @param {string} param representing param to compare to column
   */
  static get(column, param) {
    return Pool.query('SELECT * FROM service_type WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new ServiceType(results[0].type, JSON.parse(results[0].form), results[0].id, results[0].reference_counter)
      }).catch((error) => {
        throw error
      });
  }

  update() {
    return Pool.query('UPDATE service_type SET type = ?, form = ?, reference_counter WHERE id = ?', [this.type, JSON.stringify(this.form), this.referenceCounter, this.id])
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
          let element = new ServiceType(serviceType.type, JSON.parse(serviceType.form), serviceType.id, serviceType.reference_counter)
          return getPic(`serviceTypePic/${serviceType.id}.jpg`).then((pic) => {
            element.pic = pic
            return element
          })
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
