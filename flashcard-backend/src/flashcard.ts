export type Difficulty = "new" | "easy" | "hard";


/**
 * Abstraction Function (AF):
 *   AF(c: Flashcard) = A flashcard with front text `c.front`, optional back text `c.back`,
 *   difficulty level, unique ID, and creation timestamp.
 *
 * Representation Invariant (RI):
 *   - `front` must be non-empty.
 *   - `difficulty` must be "new", "easy", or "hard".
 *   - `createdAt` must be a valid Date.
 */
export class Flashcard {
  readonly id: string;
  readonly createdAt: Date;
  front: string;
  back?: string;
  difficulty: Difficulty;

  constructor(front: string, back?: string, difficulty: Difficulty = "new") {
    this.id = crypto.randomUUID();
    this.createdAt = new Date();
    this.front = front.trim();
    this.back = back?.trim();
    this.difficulty = difficulty;
    this.checkRep();
  }

  private checkRep() {
    if (!this.front || this.front.length === 0) {
      throw new Error("Flashcard must have non-empty front text");
    }

    if (!["new", "easy", "hard"].includes(this.difficulty)) {
      throw new Error("Invalid difficulty level");
    }
  }

  updateDifficulty(newDifficulty: Difficulty) {
    this.difficulty = newDifficulty;
    this.checkRep();
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      front: this.front,
      back: this.back,
      difficulty: this.difficulty,
    };
  }
}
