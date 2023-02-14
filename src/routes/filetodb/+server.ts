/**
import { json, type RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import { cirql } from '$lib/server/db';
import { query } from 'cirql';
import { ClassSchema, StudentSchema } from '$lib/schema';
export const GET: RequestHandler = async ({ request }) => {
	const classes = JSON.parse((await fs.readFile('classes.json')).toString());
	const students = JSON.parse((await fs.readFile('students.json')).toString()).map(
		(student: any) => {
			return {
				id: student.id,
				name: student.name,
				class: student.class,
				lectio_id: student.lectio_id,
				gender: student.gender,
				picture_id: student.picture_id,
				school: '57'
			};
		}
	);
	const uploadClasses = await cirql.execute({
		query: query('INSERT INTO class $classes'),
		params: { classes: classes },
		schema: ClassSchema
	});
	const uploadStudents = await cirql.execute({
		query: query('INSERT INTO student $students'),
		params: { students: students },
		schema: StudentSchema
	});
	return json({ classes: uploadClasses, students: uploadStudents });
};

*/
