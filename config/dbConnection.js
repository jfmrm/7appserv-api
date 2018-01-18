import mysql from 'promise-mysql';

export let Pool = mysql.createPool({
  host           : '172.23.0.2',
  user           : 'root',
  password       : 'hgs21@2017',
  database       : '7appserv_db',
  connectionLimit: 5
});
