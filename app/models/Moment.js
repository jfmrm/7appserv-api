import { Pool } from 'config';
import { ServiceType } from './';
import { getPic } from '../routes/helpers/aws';

export class Moment {
    
    /**
     * Constructor for Moment
     * @param {string} title
     * @param {string} description
     * @param {ServiceType[]} serviceTypes
     * @param {number} momentId
     */
    constructor(title, description, serviceTypes = [], momentId = null) {
        this.id = momentId
        this.title = title
        this.description = description
        this.serviceTypes = serviceTypes
    }

    create() {
        return Pool.query('INSERT INTO moment (title, description) VALUES (?, ?)', [this.title, this.description])
            .then(results => {
                this.id = results.insertId
                return Moment.get('id', this.id)
            })
            .catch(error => {
                throw error
            });
    }

    /**
     * Return Moment based on query
     * @param {string} column representing sql column
     * @param {string} param representing param to compare to column
     */
    static get(column, param) {
        let moment = null
        return Pool.query(`SELECT M.id, M.title, M.description FROM moment AS M WHERE M.${column} = ?`, [param])
            .then(results => {
                moment = results[0]
                moment = new Moment(moment.title, moment.description, [], moment.id)
                return Pool.query('SELECT S.id, S.type FROM service_type AS S, moment_service_type_relationship MS WHERE MS.moment_id = ? AND MS.service_type_id = S.id', moment.id)
            })
            .then(results => {
                const serviceTypes = results
                for (let i = 0; i < serviceTypes.length; i++) {
                    const element = serviceTypes[i]
                    moment.serviceTypes.push(new ServiceType(element.type, {}, element.id))
                }
                return moment
            })
            .catch(error => {
                throw error
            });
    }

    update() {
        return Pool.query('UPDATE moment SET title = ?, description = ? WHERE id = ?', [this.title, this.description, this.id])
            .then(results => {
                return this
            })
            .catch(error => {
                throw error
            });
    }

    /**
     * Add a service type to a moment
     * @param {number} id momentId
     * @param {number} serviceTypeId 
     */
    static addServiceType(id, serviceTypeId) {
        return Pool.query('INSERT INTO moment_service_type_relationship (moment_id, service_type_id) VALUES (?, ?) ', [id, serviceTypeId])
            .then(results => {
                return true
            })
            .catch(error => {
                throw error
            });
    }

    /**
     * Remove a service type of a moment
     * @param {number} id momentId
     * @param {number} serviceTypeId 
     */
    static removeServiceType(id, serviceTypeId) {
        return Pool.query('DELETE FROM moment_service_type_relationship WHERE moment_id = ? AND service_type_id = ?', [id, serviceTypeId])
            .then(res => {
                if(res.affectedRows > 0) {
                    return true
                } else {
                    throw new Error('Resource does not exist')
                }
            })
            .catch(error => {
                throw error
            });
    }

    remove() {
        return Pool.query('DELETE FROM moment WHERE id = ?', [this.id])
            .then(res => {
                return Pool.query('DELETE FROM moment_service_type_relationship WHERE moment_id = ?', [this.id])
            })
            .then(res => {
                if(res.affectedRows == 1) {
                    return true
                } else {
                    throw new Error('Moment does not exist')
                }
            })
            .catch(error => {
                throw error
            });
    }

    static list() {
        return Pool.query(`SELECT id, title, description FROM moment`)
            .then(results => {
                let moments = results
                return Promise.all(moments.map(moment => {
                    moment = new Moment(moment.title, moment.description, [], moment.id)
                    return Pool.query('SELECT S.id, S.type FROM service_type AS S, moment_service_type_relationship MS WHERE MS.moment_id = ? AND MS.service_type_id = S.id', moment.id)
                        .then(results => {
                            const serviceTypes = results
                            return Promise.all(serviceTypes.map((serviceType) => {
                                return getPic('serviceTypePic/', serviceType.id)
                            })).then((pics) => {
                                for (let i = 0; i < serviceTypes.length; i++) {
                                    const element = serviceTypes[i]
                                    let serviceType = new ServiceType(element.type, {}, element.id)
                                    serviceType.pic = pics[i]
                                    moment.serviceTypes.push(serviceType)
                                }
                                return getPic('momentPic/', moment.id)
                                    .then((pic) => {
                                        moment.pic = pic;
                                        return moment
                                    })
                            })
                        })
                        .catch(error => {
                            throw error
                        })
                }))
                    .then(results => {
                        return results
                    })
            })
            .catch(error => {
                throw error
            });
    }

}
