import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { cirql } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { Client } from '$lib/lectio';
import { query } from 'cirql';
import type { StudentSchema } from '$lib/schema';
export const actions = {
	default: async ({ request, url, cookies }: RequestEvent) => {
		const data = await request.formData();
		const [username, password, school] = [
			data.get('username'),
			data.get('password'),
			data.get('school') || '57'
		];
		if (
			!username ||
			!password ||
			!school ||
			typeof username !== 'string' ||
			typeof password !== 'string' ||
			typeof school !== 'string'
		)
			return fail(400, {
				ok: false,
				success: false,
				statusText: 'Forkert brugernavn, skole eller adgangskode'
			});
		const client = new Client({
			username: username,
			password: password,
			schoolId: school
		});
		const worked = await client.authenticate();
		if (!worked)
			return fail(400, {
				ok: false,
				success: false,
				statusText: 'Forkert brugernavn, skole eller adgangskode'
			});
		const { lectioId, sessionId, expires, lectioTicket, lectiogsc } = client;
		// await cirql.ready();
		// const user = await cirql.execute({
		// 	query: query(
		// 		`UPDATE (select id from student where lectio_id == "${lectioId}" limit 1) MERGE {username: "${username}", password: "${password}", lectio_tokens: {token: "${sessionId}", expires: "${expires}", ticket: "${lectioTicket}", gsc: "${lectiogsc}"}}`
		// 	).single(),
		// 	schema: StudentSchema
		// });
		const DATA = `UPDATE (SELECT id FROM student WHERE lectio_id == "${lectioId}" LIMIT 1) MERGE {username: "${username}", password: "${password}", lectio_tokens: {token: "${sessionId}", expires: "${expires}", ticket: "${lectioTicket}", gsc: "${lectiogsc}"}}`;
		const user = await fetch('https://surrealhost.fly.dev/sql', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				NS: 'lectio',
				DB: 'main',
				Authorization:
					'Basic ' + Buffer.from(`root:dette-er-min-kode-til-surrealdb`).toString('base64')
			},
			body: DATA
		})
			.then((response) => response.json())
			.then((data) => {
				if (data[0].result[0].name) return data[0].result[0];
				else return null;
			})
			.catch((error) => console.error(error));
		console.log(user);
		if (!user)
			return fail(400, {
				ok: false,
				success: false,
				statusText: 'Forkert brugernavn, skole eller adgangskode'
			});
		const token = jwt.sign(
			{
				lectio_id: user.lectio_id,
				school_id: '57',
				id: user.id,
				tk: 'student',
				ns: 'lectio',
				db: 'main',
				sc: 'student'
			},
			'bD8gLl0EJQYjHkcOv9Xb+1CwnjZUBJ4sE+xg0zRtFkE=',
			{ algorithm: 'HS512', expiresIn: '1d' }
		);
		console.log(token);
		console.log(url.searchParams.get('redirectTo'));
		cookies.set('token', token, { path: '/', httpOnly: false });
		cookies.set('ASP.NET_SessionId', client.sessionId, {
			path: '/',
			httpOnly: true,
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
		});
		cookies.set('uid', user.id, { path: '/', httpOnly: false });
		console.log(client.sessionId);
		console.log(user.id);
		if (url.searchParams.has('redirectTo')) {
			throw redirect(303, url.searchParams.get('redirectTo'));
		}
		return { ok: true, success: true, status: 200 };
	}
};
