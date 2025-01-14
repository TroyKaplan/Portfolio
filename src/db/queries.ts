import { pool } from '../config/database';

export const createUser = async (username: string, hashedPassword: string) => {
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, role',
    [username, hashedPassword]
  );
  return result.rows[0];
};

export const updateUserRole = async (userId: number, role: string) => {
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role',
    [role, userId]
  );
  return result.rows[0];
};

export const findUserById = async (id: number) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const findUserByUsername = async (username: string) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}; 