import mysql from 'promise-mysql';

export let Pool = mysql.createPool({
  host           : process.env.DB_HOST,
  user           : process.env.DB_USER,
  password       : process.env.DB_PASSWORD,
  database       : process.env.DATABASE,
  connectionLimit: process.env.DB_CONNECTIONS
});
