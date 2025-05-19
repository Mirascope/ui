import { stripHighlightMarkers } from "./code-highlight";
import { describe, expect, it } from "bun:test";

// Test cases for different comment styles and highlighting patterns
describe("stripHighlightMarkers", () => {
  // Tests for removing highlight markers
  it("should remove JavaScript-style highlight comments", () => {
    const input = "const foo = 'bar'; // [!code highlight]";
    const expected = "const foo = 'bar';";
    expect(stripHighlightMarkers(input)).toBe(expected);
  });

  it("should remove Python-style highlight comments", () => {
    const input = "foo = 'bar' # [!code highlight]";
    const expected = "foo = 'bar'";
    expect(stripHighlightMarkers(input)).toBe(expected);
  });

  it("should remove HTML-style highlight comments", () => {
    const input = "<div>Hello</div> <!-- [!code highlight] -->";
    const expected = "<div>Hello</div>";
    expect(stripHighlightMarkers(input)).toBe(expected);
  });

  it("should remove SQL-style highlight comments", () => {
    const input = "SELECT * FROM users -- [!code highlight]";
    const expected = "SELECT * FROM users";
    expect(stripHighlightMarkers(input)).toBe(expected);
  });

  // Tests for preserving regular comments
  it("should preserve regular comments without highlight markers", () => {
    const regularComments = [
      "// This is a regular comment",
      "# Python comment",
      "/* CSS comment */",
      "<!-- HTML comment -->",
      "-- SQL comment",
    ];

    regularComments.forEach((comment) => {
      expect(stripHighlightMarkers(comment)).toBe(comment);
    });
  });

  it("should preserve comments that contain the word 'highlight' but not the marker", () => {
    const comments = [
      "// This code will highlight the button",
      "# Highlight this section in the UI",
      "/* Highlighting is important */",
      "<!-- Highlight feature -->",
      "-- Highlight the row",
    ];

    comments.forEach((comment) => {
      expect(stripHighlightMarkers(comment)).toBe(comment);
    });
  });

  it("should preserve inline comments in the middle of lines", () => {
    const lines = [
      "function test() { // This is a comment } return true;",
      "x = 5 # set x to 5",
      "margin: 0; /* reset margin */ padding: 0;",
    ];

    lines.forEach((line) => {
      expect(stripHighlightMarkers(line)).toBe(line);
    });
  });

  it("should leave code without highlight markers unchanged", () => {
    const input = "const foo = 'bar';";
    expect(stripHighlightMarkers(input)).toBe(input);
  });

  it("should handle multiline code with mixed highlighting", () => {
    const input = `line 1
line 2 // [!code highlight]
line 3 # [!code highlight]
line 4 /* [!code highlight] */
line 5 <!-- [!code highlight] -->
line 6`;

    const expected = `line 1
line 2
line 3
line 4
line 5
line 6`;

    expect(stripHighlightMarkers(input)).toBe(expected);
  });

  it("should handle mixed regular comments and highlight markers", () => {
    const input = `// Regular comment
const x = 5; // [!code highlight]
/* Another regular comment */
const y = 10; /* [!code highlight] */
// [!code highlight]
// Another regular comment`;

    const expected = `// Regular comment
const x = 5;
/* Another regular comment */
const y = 10;
// Another regular comment`;

    expect(stripHighlightMarkers(input)).toBe(expected);
  });

  it("should handle comment markers with extra whitespace", () => {
    const inputs = [
      "const foo = 'bar';   //   [!code highlight]  ",
      "foo = 'bar'     #    [!code highlight]",
      "color: red;   /*    [!code highlight]    */",
      "<div>Hello</div>   <!--    [!code highlight]   -->",
      "SELECT * FROM users   --    [!code highlight]",
    ];

    const expected = [
      "const foo = 'bar';",
      "foo = 'bar'",
      "color: red;",
      "<div>Hello</div>",
      "SELECT * FROM users",
    ];

    inputs.forEach((input, i) => {
      expect(stripHighlightMarkers(input)).toBe(expected[i]);
    });
  });

  it("should handle edge cases", () => {
    // Empty string
    expect(stripHighlightMarkers("")).toBe("");

    // Just a highlight marker
    expect(stripHighlightMarkers("// [!code highlight]")).toBe("");
  });
});
