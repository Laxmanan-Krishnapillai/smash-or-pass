/*
import { Client } from '$lib/lectio';
import { cirql } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { create, query } from 'cirql';
import { ClassSchema, SchoolSchema, StudentSchema } from '$lib/schema';
export const GET: RequestHandler = async ({ request }) => {
	const client = new Client({
		username: 'siva0077',
		password: '00TestKedel.',
		schoolId: '57'
	});
	const worked = await client.authenticate();
	if (!worked) new Response('Forkert brugernavn eller adgangskode', { status: 400 });
	const regex = /<a[^>]*href=['"][^"']+klasseid[^"']+["'][^>]*>([^<]+)<\/a>/g;
	const classes = (
		await (
			await fetch('https://www.lectio.dk/lectio/57/FindSkema.aspx?type=stamklasse', {
				headers: {
					Cookie: 'ASP.NET_SessionId=' + client.sessionId
				}
			})
		).text()
	).match(regex);
	if (!classes) return json({ error: 'No classes found' });
	const parsedClasses = classes!
		.map((e) => {
			const klasse_id = e.match(/klasseid=(\d+)/);
			const name = e.match(/>([^<]+)<\/a>/);
			if (!klasse_id || !name) return null;
			return {
				klasse_id: klasse_id[1],
				name: name[1]
			};
		})
		.filter((c) => c);
	parsedClasses.pop();
	const dbschool = await cirql.execute({
		query: create('school:eg'),
		schema: SchoolSchema,
		params: {
			name: 'Espergærde Gymnasium',
			lectio_id: '57'
		}
	});
	await throttleUploadStudents(parsedClasses as klasse[], 2000, dbschool.id, client.sessionId);
	// fs.writeFile('classes.json', JSON.stringify(parsedClasses));
	return json('done');
};

type klasse = {
	klasse_id: string;
	name: string;
};

const getStudents = async (klasse_id: string, sessionId: string) => {
	const students_res = await (
		await fetch(
			`https://www.lectio.dk/lectio/57/subnav/members.aspx?klasseid=${klasse_id}&showstudents=1&reporttype=withpics`,
			{
				headers: {
					Cookie: 'ASP.NET_SessionId=' + sessionId
				}
			}
		)
	).text();
	const students = students_res
		.match(/<tr>([\s\S]*?)<\/tr>/g)
		?.map((el) => {
			const picture_id = el.match(/pictureid=(\d+)/);
			const lectio_id = el.match(/elevid=(\d+)/);
			const fullName = el.match(/<a[^>]*>([^<]+)<\/a>/);
			const lastName = el.match(
				/<td class="largeCol" data-lectioContextCard="S[^"]+">\s*<span class="noWrap">([^<]+)<\/span>/
			);
			if (!lectio_id || !picture_id || !fullName || !lastName) return null;
			return {
				lectio_id: lectio_id[1],
				picture_id: picture_id[1],
				fullName: fullName[1],
				lastName: lastName[1]
			};
		})
		.filter((e) => e);
	const student_count_string = students_res.match(/Antal elever: (\d+)/);
	if (!student_count_string || !student_count_string[1]) return;
	if (students === undefined) return;
	return {
		students,
		student_count: parseInt(student_count_string[1])
	};
};

// throttleUploadStudents is a function that does your processing spaced by the given interval millisecond
const throttleUploadStudents = async (
	items: klasse[],
	interval: number,
	dbschoolId: string,
	sessionId: string
) => {
	if (items.length == 0) {
		// stop when there's no more items to process
		console.log('ALL DONE');
		return;
	}
	const klasse = items[0];
	const students = await getStudents(klasse.klasse_id, sessionId);
	if (students && students.students.length > 0) {
		console.log(students);
		const dbklasse = await cirql.execute({
			query: create('class'),
			schema: ClassSchema,
			params: {
				name: klasse.name,
				lectio_id: klasse.klasse_id,
				student_count: students.student_count,
				school: dbschoolId
			}
		});
		if (dbklasse) {
			const studentArray = students.students.map((student) => {
				if (!student) return null;
				return {
					class: dbklasse.id,
					lectio_id: student.lectio_id,
					picture_id: student.picture_id,
					name: student.fullName + ' ' + student.lastName
				};
			});
			const dbstudents = await cirql.execute({
				query: query('INSERT into student $studentArray'),
				schema: StudentSchema,
				params: { studentArray }
			});
			console.log(dbstudents);
		}
	}
	setTimeout(
		() => throttleUploadStudents(items.slice(1), interval, dbschoolId, sessionId), // wrap in an arrow function to defer evaluation
		interval
	);
};
*/
