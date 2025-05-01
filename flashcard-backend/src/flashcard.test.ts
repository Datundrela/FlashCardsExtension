import { Flashcard } from "./flashcard";

describe("Flashcard", () => {
  it("creates a flashcard with valid data", () => {
    const card = new Flashcard("What is AI?", "Artificial Intelligence", "new");

    expect(card.front).toBe("What is AI?");
    expect(card.back).toBe("Artificial Intelligence");
    expect(card.difficulty).toBe("new");
    expect(card.id).toBeDefined();
    expect(card.createdAt).toBeInstanceOf(Date);
  });

  it("throws error on empty front", () => {
    expect(() => new Flashcard("")).toThrow("Flashcard must have non-empty front text");
  });

  it("throws error on invalid difficulty", () => {
    expect(() => new Flashcard("Question", "Answer", "medium" as any)).toThrow("Invalid difficulty level");
  });

  it("can update difficulty", () => {
    const card = new Flashcard("Q?", "A");
    card.updateDifficulty("easy");
    expect(card.difficulty).toBe("easy");
  });
});
