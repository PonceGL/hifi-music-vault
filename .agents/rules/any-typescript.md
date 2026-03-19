---
trigger: model_decision
description: In new functions or business logic, using generic types (<T>) or unions (string | number)
---

Specific Use Cases:
Migrating from JavaScript to TypeScript: When converting .js files to .ts and you don’t know or don’t want to define complex types initially, `any` allows the project to compile.
External APIs or Dynamic Data: When receiving data from a server whose format is unpredictable or changes, `any` allows you to handle the value before validating it (type narrowing).
Libraries Without Type Definitions: If a JS library lacks type files (@types/) and it’s not possible to create them quickly, `any` allows you to use the library without compiler errors.
`console.log` or Debugging: To quickly inspect variables without configuring a structured type.
Callbacks that ignore arguments: Functions that accept parameters based on the interface signature but do not use them (e.g., (event: any) => void). 
Recommendations:
Use `unknown` instead of `any` when the type is unknown but will be verified later.