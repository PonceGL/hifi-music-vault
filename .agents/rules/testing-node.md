---
trigger: always_on
---

Fundamental Principles (FIRST)
Fast: They must run in milliseconds. If they are slow, developers will not run them frequently.
Isolated/Independent: A test should not depend on the result of another. They can run in parallel.
Repeatable: They must produce the same result every time, regardless of the environment.
Self-Validating: The test must automatically determine whether it passed or failed (asserts), not through manual inspection.
Timely: Ideally, write them before or during the development of the functionality (TDD). 
Structure and Best Practices
AAA Pattern (Arrange, Act, Assert):
Arrange: Set up the environment and necessary data (e.g., create mocks).
Act: Execute the function or method you are testing.
Assert: Verify that the result is as expected.
Mocking/Isolation: Do not use real databases, networks, or files. Use libraries such as jest.fn() or sinon to simulate dependencies.
Clear Nomenclature: The name should describe the scenario and the expected result (e.g., should_return_user_when_id_is_valid).
File Structure: Place tests near the source code (e.g., calculator.js and calculator.test.js) or in a __tests__ folder with the same folder structure as the file being tested, depending on the project.