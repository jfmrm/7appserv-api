import { Pro } from 'models';
import { Pool } from 'config';
import {getPic} from '../../app/routes/helpers';

export class ProVIP extends Pro {
  constructor (pro, ein, companyName, licenseNumber){
    super (pro.firstName, pro.lastName, pro.email, pro.birthDate, pro.address, pro.description, pro.rate, pro.id, 'VIP');
    this.ein = ein;
    this.companyName = companyName;
    this.licenseNumber = licenseNumber;
  }

  create() {
    return Pool.query('INSERT INTO pro_vip (pro_id, ein, company_name, license_number) VALUES (?, ?, ?, ?)',
    [this.id, this.ein, this.companyName, this.licenseNumber])
      .then((results) => {
        return ProVIP.updateProType(this.id)
      }).catch((error) => {
        throw error
      });
  }

  static get(column, param) {
    return new Pro().get('id', param)
      .then((pro) => {
        let results = Pool.query('SELECT * FROM pro_vip WHERE pro_id = ?', [param])
        return ({ results: results, pro: pro })
      }).then(({ results: results, pro: pro }) => {
        return results.then((res) => {
          return new ProVIP(pro, res[0].ein, res[0].company_name, res[0].license_number)
        })
      }).catch((error) => {
        throw error
      });
  }

  update() {
    return Pool.query('UPDATE pro_vip SET ein = ?, company_name = ?, license_number = ? WHERE pro_id = ?',
    [this.ein, this.companyName, this.licenseNumber, this.id])
      .then(() => {
        return super.update()
      }).then((pro) => {
        return this.get('id', this.id)
      }).catch((error) => {
        throw error
      });
  }

  remove() {
    return Pool.query('DELETE FROM pro_vip WHERE pro_id = ?', [this.id])
      .then((result) => {
        if(result.affectedRows == 1) {
          return true
        } else {
          throw new Error('Pro VIP does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }

  static getProVIPList(cityId) {
    return Pool.query(`SELECT pro.id, pro_vip.company_name, pro.rate, address.latitude, address.longitude
                       FROM pro_vip
                       INNER JOIN pro ON pro.id = pro_vip.pro_id
                       INNER JOIN address ON pro.address_id = address.id
                       WHERE pro_vip.pro_id = pro.id AND address.city_id = ?`, [cityId])
      .then((results) => {
        return results.map((proVIPListItem) => {
          return getPic(`profilePic/pros/${proVIPListItem.id}.jpg`).then((pic) => {
            return {
              proId: proVIPListItem.id,
              companyName: proVIPListItem.company_name,
              rate: proVIPListItem.rate,
              latitude: proVIPListItem.latitude,
              longitude: proVIPListItem.longitude,
              actionRadious: proVIPListItem.action_radious,
              pic
            }  
          })
        })
      }).catch((error) => {
        throw error
      });
  }

  static updateProType(id) {
    return Pool.query(`UPDATE pro SET pro_type = 'VIP' WHERE id = ?`, [id])
      .then((results) => {
        if(results.affectedRows == 1) {
          return ProVIP.get('id', id);
        } else {
          throw new Error('Could not update pro type')
        }
      }).catch((error) => {
        throw error
      })
  }
}
