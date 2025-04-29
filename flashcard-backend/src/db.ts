import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_SERVER as string,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: process.env.DB_DOMAIN || '',
      userName: process.env.DB_WIN_USER || '',
      password: process.env.DB_WIN_PASS || '',
    },
  },
};

console.log('DB Config:', config);

export const pool = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server with Windows Authentication');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed!', err);
    throw err;
  });

