# Flashloan AMM Interface

<img width="507" alt="Screenshot 2025-06-23 at 00 57 47" src="https://github.com/user-attachments/assets/e7442bdb-9bc9-4922-a9dd-d58cd32d75c8" />

## Overview
A secure automated market maker with built-in TWAP oracle protection and flashloan-resistant design.

## Quick Start
1. [Connect your wallet](docs/user-guides/getting-started.md#connecting-your-wallet)
2. [Select tokens](docs/user-guides/getting-started.md#selecting-tokens)
3. [Execute a swap](docs/user-guides/swap-execution.md)

## Documentation
- [Getting Started](docs/user-guides/getting-started.md)
- [Swap Execution](docs/user-guides/swap-execution.md)
- [Security Features](docs/user-guides/security-features.md)

## Security Notice
Always verify you're interacting with the official contract:
`Hexfz6ziQfSp6gzGRyNf2RAc7akNykz8ggeLqXrKj82s`

```mermaid
flowchart LR
    A[User] -->|1. Connect| B[Wallet]
    B -->|2. Select| C[Tokens]
    C -->|3. Review| D[Swap Details]
    D -->|4. Confirm| E[Transaction]
