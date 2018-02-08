import { Pool } from 'config';
import { Pro, Demand } from 'models';

export class Quotation {
    constructor (pro, demand, value, dueDate, details, visulized, id) {
        this.pro = pro;
        this.demand = demand;
        this.value = value;
        this.dueDate = dueDate;
        this.details = details;
        this.visulized = visulized;
        this.id = id;
    }

    create() {
        return Pool.query(`INSERT INTO quotation (pro_id, demand_id, value, due_date, details)
                            VALUES (?, ?, ?, ?, ?)`, [this.pro, this.demand, this.value, this.dueDate, this.details])
            .then((results) => {
                return this.get('id', results.insertId)
            }).catch((error) => {
                throw error
            });
    }

    get(column, param) {
        return Pool.query('SELECT * FROM quotation WHERE ' + column + ' = ?', [param])
            .then((results) => {
                return Promise.all([
                    new Pro().get('id', results[0].pro_id),
                    new Demand().get('id', results[0].demand_id),
                ]).then((res) => {
                    return new Quotation(res[0], res[1], results[0].value, results[0].due_date, results[0].details, results[0].visulized, results[0].id)
                })
            }).catch((error) => {
                throw error
            });
    }

    update() {
        return Pool.query('UPDATE quotation SET value = ?, due_date = ?, details = ? WHERE id = ?',
                            [this.value, this.dueDate, this.details, this.id])
            .then((results) => {
                return this.get('id', this.id)
            }).catch((error) => {
                throw error
            });
    }

    remove() {
        return Pool.query('DELETE FROM quotation WHERE id = ?', [this.id])
            .then((results) => {
                if(results.affectedRows >= 1) {
                    return true
                } else {
                    throw new Error('Could not remove this quotation')
                }
            }).catch((error) => {
                throw error
            })
    }
}