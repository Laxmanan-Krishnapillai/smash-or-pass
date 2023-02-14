import { db } from '$lib/server/db';
import * as jwt from 'jsonwebtoken';
import fs from 'fs/promises';
export const POST = async (req: Request) => {
	const { school, userId, vote } = await req.json();
	const cookie = req.headers.get('Cookie');
	if (!cookie) return new Response('Not logged in', { status: 401 });
	const tokenCookie = cookie.split('token=')[1].split(';')[0];
	if (!tokenCookie) return new Response('Not logged in', { status: 401 });
	const token = jwt.verify(tokenCookie, 'secret', { algorithms: ['HS512'] }) as jwt.JwtPayload;
	const j = await db.query('RELATE $auth_user->voted_on $user SET vote = $vote', {
		auth_user: token.id,
		user: userId,
		vote: vote === 1 ? 1 : -1
	});
};
