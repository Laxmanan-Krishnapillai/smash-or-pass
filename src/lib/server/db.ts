import { Cirql, CirqlStateless } from 'cirql';
import { SURREALDB_USER, SURREALDB_PASS } from '$env/static/private';
const cirql = new Cirql({
	connection: {
		endpoint: 'https://surrealhost.fly.dev/',
		namespace: 'lectio',
		database: 'main'
	},
	credentials: {
		user: SURREALDB_USER,
		pass: SURREALDB_PASS
	}
});
export { cirql };
