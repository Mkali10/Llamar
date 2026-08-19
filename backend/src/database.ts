import pg from 'pg';
const {Pool}=pg;
export const pool=new Pool({connectionString:process.env.DATABASE_URL,max:Number(process.env.DATABASE_POOL_MAX??20),idleTimeoutMillis:30000,connectionTimeoutMillis:5000,application_name:'llamar-control-plane'});
export async function databaseReady(){const result=await pool.query<{ok:number}>('SELECT 1 AS ok');return result.rows[0]?.ok===1}
export async function withTenant<T>(tenantId:string,work:(client:pg.PoolClient)=>Promise<T>):Promise<T>{const client=await pool.connect();try{await client.query('BEGIN');await client.query("SELECT set_config('app.tenant_id',$1,true)",[tenantId]);const result=await work(client);await client.query('COMMIT');return result}catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}}
export async function closeDatabase(){await pool.end()}
