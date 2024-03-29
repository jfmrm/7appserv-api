import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3 } from 'aws-sdk';
import { resolve } from 'url';

let s3 = new S3({apiVersion: '2006-03-01'})

export let uploadCustomerProfilePic = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.MY_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      let extention = file.originalname.split('.')
      cb(null, 'profilePic/customers/' + req.params.customerId + '.' + extention[1])
    }
  })
})

export let uploadProProfilePic = multer({
  storage: multerS3({
      s3: s3,
      bucket: process.env.MY_BUCKET,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        let extention = file.originalname.split('.')
        cb(null, 'profilePic/pros/' + req.params.proId + '.' + extention[1])
      }
    })
})

export let uploadServiceTypePic = multer({
  storage: multerS3({
      s3: s3,
      bucket: process.env.MY_BUCKET,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        let extention = file.originalname.split('.')
        cb(null, 'serviceTypePic/' + req.params.serviceTypeId + '.' + extention[1])
      }
    })
})

export let uploadMomentPic = multer({
  storage: multerS3({
      s3: s3,
      bucket: process.env.MY_BUCKET,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        let extention = file.originalname.split('.')
        cb(null, 'momentPic/' + req.params.momentId + '.' + extention[1])
      }
    })
})

export function getPic(key) {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', 
      {Bucket: '7appserv', Key: key}, 
      (err, url) => {
        if (err) reject(err)
        resolve(url)
      })
  })
}