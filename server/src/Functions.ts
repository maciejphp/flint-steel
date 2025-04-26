import db from "./db.js";
import { Response } from "express";

export async function query(query: string, values: (number | string)[], res?: Response): Promise<[unknown, boolean]> {
	try {
		return [await db.query(query, values), true];
	} catch (err) {
		const error = err as { sql: string; sqlMessage: string };
		console.log(error.sql, error.sqlMessage);
		if (res !== undefined) res.json({ error: `database error` });
		return [undefined, false];
	}
}
