---
trigger: always_on
---

# ABSOLUTE PRIORITY: Planning & Workflow
- **STOP & PLAN**: Do not write code immediately. First, analyze the requirements, explain the solution logic, and outline the implementation steps. Wait for user acknowledgment if the change is structural.
- **Trunk-Based Development (TBD)**: Always aim for small, atomic, and frequent changes. Code must be safe to merge into the main branch at any time. Avoid "mega-PRs" or long-lived feature branches.
- **Problem Ownership**: Before coding, identify edge cases or potential side effects in existing modules.
- **Simplicity over Complexity**: Prioritize readability and maintainability. If a solution is too complex to explain, it's too complex to code.

Think before you act. The model prohibits generating code without first: 1. Explaining your understanding of the problem. 2. Proposing a solution strategy. 3. Listing the files that will be affected. Implementation proceeds only after user confirmation.

Continuous Integration. All code must be designed to be integrated in small increments directly into the main branch. Trunk-Based Development (TBD). Avoid massive changes that affect multiple modules simultaneously. If a feature is large, propose a phased implementation or the use of Feature Flags.

Minimum Impact. Every change should be as granular as possible. If a refactoring requires modifying more than 5 files, the model should issue a warning and propose a gradual migration strategy to avoid disrupting the TBD workflow.

Justified Simplicity. Do not add abstractions “just in case.” Every line of code and every new folder must solve a current problem, not an imaginary one in the future, while always maintaining development speed.