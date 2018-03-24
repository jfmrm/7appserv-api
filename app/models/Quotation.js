import { Pool } from 'config';
import { Pro, Demand } from 'models';
import { isError } from 'util';
import { Service } from './Service';

export class Quotation {
    constructor (pro, demand, value, details, visulized, id, serviceId) {
        this.pro = pro;
        this.demand = demand;
        this.value = value;
        this.details = details;
        this.visulized = visulized;
        this.id = id;
        this.serviceId = serviceId;
    }

    create() {
        return Pool.query(`INSERT INTO quotation (pro_id, demand_id, value, details)
                            VALUES (?, ?, ?, ?)`, [this.pro, this.demand, this.value, this.details])
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
                    return new Quotation(res[0], res[1], results[0].value, results[0].details, results[0].visulized, results[0].id, results[0].service_id)
                })
            }).catch((error) => {
                throw error
            });
    }

    update() {
        return Pool.query('UPDATE quotation SET value = ?, details = ? WHERE id = ?',
                            [this.value, this.details, this.id])
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

    getQuotationListFromDemand(demandId) {
        return Promise.all([
            Pool.query(`SELECT pro_vip.company_name, pro.rate, quotation.value, quotation.id 
                        FROM quotation
                        INNER JOIN pro ON pro.id = quotation.pro_id
                        INNER JOIN pro_vip ON pro.id
                        WHERE demand_id = ? AND pro.pro_type = 'VIP'`, [demandId]),
            Pool.query(`SELECT pro.first_name, pro.last_name, quotation.value, quotation.id
                        FROM quotation
                        INNER JOIN pro ON pro.id = quotation.pro_id
                        WHERE demand_id = ? AND pro.pro_type = 'Standard'`, [demandId])
        ]).then((results) => {
            let vipQuotations = results[0].map((vipQuotation) => {
                return { 
                    companyName: vipQuotation.companyName,
                    proRate: vipQuotation.rate,
                    value: vipQuotation.value,
                    quotationId: vipQuotation.id
                }
            })
            let standrdQuotations = results[1].map((standardQuotation) => {
                return {
                    proFirstName: standardQuotation.first_name,
                    proLastName: standardQuotation.last_name,
                    //add rating
                    value: standardQuotation.value,
                    quotationId: standardQuotation.id
                }
            })

            return { vipQuotation: vipQuotations, standardQuotation: standrdQuotations}
        }).catch((error) => {
            throw error
        });
    }

    visualize(demandId) {
        return Pool.query('UPDATE quotation SET visualized = true WHERE demand_id = ?', [demandId])
            .then((results) => {
                if(results.affectedRows >= 0) {
                    //trigger notification to the pro
                    return true
                } else {
                    throw new Error("Could not alter quotation visualization status")
                }
            }).catch((error) => {
                throw error
            });
    }

    accept(quotationId) {
        return Pool.query('UPDATE quotation SET chosen = true WHERE id = ?', [quotationId])
            .then((results) => {
                return Pool.query('SELECT pro_id, demand_id FROM quotation WHERE id = ?', [quotationId])
            }).then((results) => {
                let p = new Demand().close(results[0].demand_id)
                return {p, results}
            }).then(({p, results}) => {
                return p.then((closed) => {
                    p = new Demand().get('id', results[0].demand_id)
                    return {p, results}
                })
            }).then(({p, results}) => {
                return p.then((demand) => {
                    return new Service(demand, results[0].pro_id).create()
                })
            }).catch((error) => {
                throw error
            });
    }
}