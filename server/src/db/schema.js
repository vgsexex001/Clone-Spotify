import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const playlists = sqliteTable('playlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const playlistTracks = sqliteTable('playlist_tracks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playlistId: integer('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  trackId: text('track_id').notNull(),
  source: text('source').notNull(), // 'deezer' | 'jamendo'
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album'),
  albumCover: text('album_cover'),
  previewUrl: text('preview_url'),
  duration: integer('duration'),
  position: integer('position').notNull(),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const likedSongs = sqliteTable('liked_songs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackId: text('track_id').notNull(),
  source: text('source').notNull(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album'),
  albumCover: text('album_cover'),
  previewUrl: text('preview_url'),
  duration: integer('duration'),
  likedAt: integer('liked_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const listeningHistory = sqliteTable('listening_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackId: text('track_id').notNull(),
  source: text('source').notNull(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album'),
  albumCover: text('album_cover'),
  previewUrl: text('preview_url'),
  duration: integer('duration'),
  playedAt: integer('played_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const dailyMixes = sqliteTable('daily_mixes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mixIndex: integer('mix_index').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  tracksJson: text('tracks_json').notNull(), // JSON array of track objects
  genre: text('genre'),
  generatedAt: integer('generated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
