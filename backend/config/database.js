import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

export const dbConfig = {
	server: process.env.DB_SERVER || "suryafreesqldb.database.windows.net",
	database: process.env.DB_DATABASE,
	user: process.env.DB_USER || "SuryaPS3",
	password: process.env.DB_PASSWORD || "Le@rn2003",
	port: parseInt(process.env.DB_PORT) || 1433,
	options: {
		encrypt: true,
		trustServerCertificate: false,
		enableArithAbort: true,
		requestTimeout: 30000,
		connectionTimeout: 30000,
	},
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000,
	},
};

// let pool = null;
let poolPromise = null;

export const getPool = async () => {
	if (!poolPromise) {
		poolPromise = sql.connect(dbConfig);
	}
	// console.log("getPool pool:", typeof pool, pool);

	return poolPromise;
};

export const closePool = async () => {
	// console.log("closePool pool:", typeof pool, pool);
	if (poolPromise) {
		const pool = await poolPromise;
		await pool.close();
		poolPromise = null;
	}
};
