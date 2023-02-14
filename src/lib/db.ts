import Surreal from 'surrealdb.js';
import { Cirql } from 'cirql';

const cirql = new Cirql({
	connection: {
		endpoint: 'https://surrealhost.fly.dev/',
		namespace: 'lectio',
		database: 'main'
	}
});
await cirql.ready();
export { cirql };
