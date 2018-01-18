import { Pro } from './';
import { Pool } from '../../config';

export class ProVIP extends Pro {
  constructor (pro, ein, companyName, licenseNumber = null){
    super (pro.firstName, pro.lastName, pro.email, pro.password, pro.contactNumber, pro.address, pro.hasInsurance, pro.avarageResponseTime, pro.rate, pro.lastPayment, pro.id);
    this.ein = ein;
    this.companyName = companyName;
    this.licenseNumber = licenseNumber;
    this.proType = 'VIP';
  }

  create() {
    return Pool.query('INSERT INTO pro_vip (pro_id, ein, company_name, license_number) VALUES (?, ?, ?, ?)',
    [this.id, this.ein, this.companyName, this.licenseNumber])
      .then((results) => {
        return super.update()
          .then((pro) => {
            return this.get('id', this.id)
          })
      });
  }

  get(column, param) {
    return new Pro().get('id', param)
      .then((pro) => {
        let results = Pool.query('SELECT * FROM pro_vip WHERE pro_id = ?', [param])
        return ({ results: results, pro: pro })
      }).then(({ results: results, pro: pro }) => {
        return results.then((res) => {
          return new ProVIP(pro, res[0].ein, res[0].company_name, res[0].licenseNumber)
        })
      });
  }

  update() {
    return Pool.query('UPDATE pro_vip SET ein = ?, company_name = ?, license_number = ? WHERE pro_id = ?',
    [this.ein, this.companyName, this.licenseNumber, this.id])
      .then(() => {
        return super.update()
      }).then((pro) => {
        return this.get('id', this.id)
      });
  }

  remove() {
    return Pool.query('DELETE FROM pro_vip WHERE pro_id = ?', [this.id])
      .then((result) => {
        if(result.affectedRows == 1) {
          return true
        } else {
          return false
        }
      });
  }

}