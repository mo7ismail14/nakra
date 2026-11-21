/** Thrown when a collection was changed by someone else between our read and our write. */
export class ConflictError extends Error {
  constructor(name) {
    super(`Collection "${name}" was changed concurrently`);
    this.code = 'STORAGE_CONFLICT';
  }
}
