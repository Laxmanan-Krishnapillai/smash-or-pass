import { Client } from '$lib/lectio';
import { db } from '$lib/server/db';
import * as jwt from 'jsonwebtoken';
import { json, type RequestHandler } from '@sveltejs/kit';
export const POST: RequestHandler = async ({ request }) => {
	const { username, password, school } = await request.json();
	if (!username || !password || !school)
		return new Response('Felter ikke udfyldt korrekt', { status: 400 });
	const client = new Client({
		username: username,
		password: password,
		schoolId: school
	});
	try {
		const worked = await client.authenticate();
		if (!worked) new Response('Forkert brugernavn eller adgangskode', { status: 400 });
		db.use('lectio', 'main');
		console.log({
			lectioId: client.lectioId,
			username: username,
			password: password,
			token: client.sessionId,
			expires: client.expires,
			ticket: client.lectioTicket,
			gsc: client.lectiogsc
		});
		const res = await db.query(
			'UPDATE (select id from student where lectio_id = $lectioId limit 1) MERGE {username: $username, password: $password, lectio_tokens: {token: $token, expires: $expires, ticket: $ticket, gsc: $gsc}}',
			{
				lectioId: client.lectioId,
				username: username,
				password: password,
				token: client.sessionId,
				expires: client.expires,
				ticket: client.lectioTicket,
				gsc: client.lectiogsc
			}
		);
		console.log(res[0]);
		const user = res[0].result[0];
		if (!user) return new Response('Forkert brugernavn eller adgangskode', { status: 400 });
		console.log(user);
		const token = jwt.sign(
			{
				lectio_id: user.lectio_id,
				school_id: user.school_id,
				id: user.id,
				tk: 'student',
				ns: 'lectio',
				db: 'main',
				sc: 'student'
			},
			'bD8gLl0EJQYjHkcOv9Xb+1CwnjZUBJ4sE+xg0zRtFkE=',
			{ algorithm: 'HS512', expiresIn: '1d' }
		);
		console.log(
			jwt.verify(token, 'bD8gLl0EJQYjHkcOv9Xb+1CwnjZUBJ4sE+xg0zRtFkE=', { algorithms: ['HS512'] })
		);
		return json({ token: token, session: client.sessionId });
	} catch (error) {
		console.log(error);
		return new Response('Forkert brugernavn eller adgangskode', { status: 400 });
	}
};
