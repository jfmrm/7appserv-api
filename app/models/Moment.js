import { Pool } from 'config';
import { ServiceType } from './';

export class Moment {
    
    /**
     * Constructor for Moment
     * @param {number} momentId
     * @param {string} title
     * @param {string} description
     * @param {ServiceType[]} serviceTypes
     */
    constructor(title, description, serviceTypes = [], momentId = null) {
        this.id = momentId
        this.title = title
        this.description = description
        this.serviceTypes = serviceTypes
    }

    create() {
        return Pool.query('INSERT INTO moment (title, description) VALUES (?, ?)', [this.title, this.description])
            .then((results) => {
                this.id = results.insertId
                return Moment.get('id', results.insertId)
            }).catch((error) => {
                throw error
            });
    }

    /**
     * Return Moment based on query
     * @param {string} column representing sql column
     * @param {string} param representing param to compare to column
     */
    static get(column, param) {
        return Pool.query(`SELECT * FROM moment WHERE ${column} = ?`, [param])
            .then((results) => {
                return new Moment(results[0].id, results[0].title, results[0].description)
            }).catch((error) => {
                throw error
            });
    }

    update() {
        return Pool.query('UPDATE moment SET title = ?, description = ? WHERE id = ?', [this.title, this.description, this.id])
            .then((results) => {
                return this.get('id', this.id)
            }).catch((error) => {
                throw error
            });
    }

    remove() {
        return Pool.query('DELETE FROM moment WHERE id = ?', [this.id])
            .then((res) => {
                if(res.affectedRows == 1) {
                    return true
                } else {
                    throw new Error('Moment does not exist')
                }
            }).catch((error) => {
                throw error
            });
    }

}
