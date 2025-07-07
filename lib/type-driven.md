# Type-Driven Development

## Core Concept

Use the type system as an active design tool that guides implementation and provides continuous feedback. The types aren't just for preventing errors - they're a thinking tool that helps discover the right design.

## Key Principles

### 1. Types First, Implementation Later
Start by modeling your domain with types. Implementation details come after you've captured the essential structure.

```fsharp
// Define the states and their data
type ReadyData = Timed<TimeSpan list>
type ReceivedMessageData = Timed<TimeSpan list * MessageHandler>
type NoMessageData = Timed<TimeSpan list>

// Model the state machine
type PollingConsumer =
    | ReadyState of ReadyData
    | ReceivedMessageState of ReceivedMessageData
    | NoMessageState of NoMessageData
    | StoppedState
```

### 2. Let Type Inference Guide You
Don't declare types prematurely. Let inference reveal what your design implies, then evaluate if it makes sense.

```fsharp
// Start with behavior, let types emerge
let transitionFromNoMessage shouldIdle idle nm =
    if shouldIdle nm then
        idle () |> ReadyState
    else
        StoppedState

// Type system infers:
// shouldIdle: NoMessageData -> bool
// idle: unit -> ReadyData
// nm: NoMessageData
```

### 3. Read the Inferred Types as Feedback
When a function's inferred type seems wrong, it often reveals a design flaw.

```fsharp
// If idle is inferred as: unit -> Timed<TimeSpan list>
// This suggests it creates statistics from nothing - suspicious!

// Better design preserves existing data:
idle () |> Untimed.withResult nm.Result |> ReadyState
// Now idle: unit -> Timed<'a> - more reasonable
```

## The Type-Driven Process

### 1. Model the Domain
Define types that represent your domain concepts and their relationships.

### 2. Sketch High-Level Behavior
Write functions that express what you want to happen, without worrying about implementation.

### 3. Introduce Dependencies as Arguments
When you need a capability, introduce it as a function argument and let type inference determine its signature.

```fsharp
// Need to know if we should idle? Add it as an argument:
let transition shouldIdle state =
    if shouldIdle state then ...
// Type system tells us: shouldIdle must be 'state -> bool
```

### 4. Use the Implicit To-Do List
The type system maintains a list of what you still need to implement:
- Required function arguments tell you what capabilities you need
- Their inferred types tell you how to implement them
- You can't compose the system until all pieces exist

## Practical Patterns

### State Machines with Types
Each state gets its own data type, and transitions are functions between states:

```fsharp
// Each transition has a clear type signature
transitionFromReady : ReadyData -> PollingConsumer
transitionFromReceived : ReceivedMessageData -> PollingConsumer
transitionFromNoMessage : NoMessageData -> PollingConsumer
```

### Higher-Order Functions for Flexibility
Let dependencies bubble up as function arguments:

```fsharp
// Instead of hard-coding decisions:
let transition state =
    if DateTime.Now > deadline then ...

// Accept the decision logic as a parameter:
let transition shouldStop state =
    if shouldStop state then ...
```

### Partial Application for Composition
Configure general functions into specific ones:

```fsharp
// General transition function with all dependencies
let transition shouldPoll poll shouldIdle idle state = ...

// Specific transition with real implementations
let myTransition = transition myShoudPoll myPoll myShouldIdle myIdle
// myTransition : PollingConsumer -> PollingConsumer
```

## Benefits

### Design Benefits
- **Early Feedback**: Types reveal design issues before implementation
- **Focused Thinking**: Stay on high-level behavior without distraction
- **Explicit Dependencies**: All requirements visible in function signatures
- **Safe Refactoring**: Type changes propagate required updates

### Development Benefits
- **Clear Next Steps**: Missing implementations are obvious
- **Incremental Progress**: Build system outside-in
- **Low Friction**: Change designs without updating type declarations
- **Automatic Documentation**: Types document intent and requirements

## Anti-Patterns to Avoid

1. **Premature Type Annotations**: Let inference work for you
2. **Fighting the Types**: If types feel wrong, reconsider the design
3. **Over-Abstraction**: Not every function needs to be higher-order
4. **Ignoring Type Feedback**: Unusual inferred types often indicate problems

## Summary

Type-driven development uses types as a design tool, not just a safety net. By modeling your domain with types first and letting inference guide you, you can discover better designs with less effort. The type system becomes a conversation partner in the design process.
