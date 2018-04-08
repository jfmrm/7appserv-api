import { Pool } from '../../config';
import { Quotation } from '.';

export class Question {
    constructor(question, type, id, fields) {
        this.question = question;
        this.type = type;
        this.id = id;
        this.fields = fields;
    }

    create() {
        return Pool.query('INSERT INTO question (question, type, fields) VALUES(?, ?, ?)', [this.question, this.type, JSON.stringify(this.fields)])
            .then((results) => {
                return this.get('id', results.insertId)
            }).catch((error) => {
                throw error
            })
    }

    get(column, param) {
        return Pool.query('SELECT * FROM question WHERE id = ?', [param])
            .then((results) => {
                return new Question(results[0].question, results[0].type, results[0].id, JSON.parse(results[0].fields))
            }).catch((error) => {
                throw error
            });
    }

    update() {
        return Pool.query('UPDATE question SET question = ?, type = ?, fields = ? WHERE id = ?', [this.question, this.type, JSON.stringify(this.fields), this.id])
            .then((results) => {
                return this.get('id', this.id)
            }).catch((error) => {
                throw error
            })
    }

    remove() {
        return Pool.query('DELETE FROM question WHERE id = ?', [this.id])
            .then((results) => {
                if (results.affectedRows == 1) {
                    return true
                } else {
                    throw new Error ('could not remove this question')
                }
            }).catch((error) => {
                throw error
            });
    }

    static listQuestions() {
        return Pool.query('SELECT * FROM question')
            .then((results) => {
                return Promise.all(results.map((question) => {
                    return new Question(question.question, question.type, question.id, JSON.parse(question.fields))
                }))
            }).catch((error) => {
                throw error
            })
    }
}