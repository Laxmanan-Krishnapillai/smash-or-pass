import Surreal from 'surrealdb.js';
import { CirqlStateless } from 'cirql';

const cirql = new CirqlStateless({
	connection: {
		endpoint: 'https://surrealhost.fly.dev/',
		namespace: 'lectio',
		database: 'main'
	}
});
export { cirql };
