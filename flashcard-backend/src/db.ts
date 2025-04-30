import sql from 'mssql';

const dbConfig: sql.config = {
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

console.log('DB Config:', dbConfig);

export const pool = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server with SQL Authentication');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database Connection Failed!', err);
    throw err;
  });


