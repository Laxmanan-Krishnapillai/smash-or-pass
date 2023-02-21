import { z } from 'zod';
export type Student = z.infer<typeof StudentSchema>;
export const StudentSchema = z.object({
	class: z.string(),
	created_at: z.string(),
	// Elo can be string or number
	elo: z.union([z.string(), z.number()]),
	gender: z.enum(['male', 'female']),
	id: z.string(),
	lectio_id: z.string(),
	lectio_tokens: z
		.object({
			expires: z.string().optional(),
			gsc: z.string().optional(),
			ticket: z.string().optional(),
			token: z.string().optional()
		})
		.optional(),
	name: z.string(),
	password: z.string().optional(),
	picture_id: z.string(),
	username: z.string().optional(),
	school: z.string()
});

export const ClassSchema = z.object({
	lectio_id: z.string(),
	name: z.string(),
	student_count: z.number(),
	created_at: z.string(),
	school: z.string(),
	id: z.string()
});
/**
DEFINE TABLE school SCHEMAFULL PERMISSIONS FOR SELECT WHERE $token.id != NONE, FOR CREATE NONE, FOR UPDATE NONE, FOR DELETE NONE;
DEFINE FIELD lectio_id ON TABLE school TYPE string ASSERT $value != NONE;
DEFINE FIELD name ON TABLE school TYPE string ASSERT $value != NONE;
DEFINE FIELD created_at ON TABLE school TYPE datetime VALUE time::now();
 */

export const SchoolSchema = z.object({
	lectio_id: z.string(),
	name: z.string(),
	created_at: z.string(),
	id: z.string()
});
/*DEFINE TABLE elo_rating SCHEMAFULL;
DEFINE FIELD created_at ON TABLE elo TYPE datetime VALUE time::now();
DEFINE FIELD author ON TABLE elo TYPE record (student) ASSERT $value != NONE;
DEFINE FIELD winner ON TABLE elo TYPE record (student) ASSERT $value != NONE;
DEFINE FIELD loser ON TABLE elo TYPE record (student) ASSERT $value != NONE;
DEFINE FIELD winner_elo_before ON TABLE elo TYPE number VALUE $this.winner.elo;
DEFINE FIELD loser_elo_before ON TABLE elo TYPE number VALUE $this.loser.elo;
*/
export const EloRatingSchema = z.object({
	created_at: z.string(),
	author: z.string(),
	winner: z.string(),
	loser: z.string(),
	winner_elo_before: z.number(),
	loser_elo_before: z.number()
});

/*
DEFINE TABLE voted_on SCHEMAFULL;
DEFINE FIELD created_at ON TABLE voted_on TYPE datetime VALUE time::now();
DEFINE FIELD in ON TABLE voted_on TYPE record (student);
DEFINE FIELD out ON TABLE voted_on TYPE record (student);
DEFINE FIELD vote ON TABLE voted_on TYPE bool ASSERT $value != NONE;
DEFINE INDEX vote ON TABLE student COLUMNS in, out UNIQUE;
*/
export const VotedOnSchema = z.object({
	created_at: z.string(),
	in: z.string(),
	out: z.string(),
	vote: z.boolean()
});
