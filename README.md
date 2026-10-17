# 🐳 Docker Doctor


Local-first Docker diagnostic CLI with root-cause analysis.

[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## 📌 Overview
────────────────────────────────────

What is Docker Doctor?

What problem does it solve?

Who is it for?

Example:
Docker Doctor is a local-first Docker diagnostic CLI that analyzes
containers, logs, networks, environment variables, and service
dependencies to identify likely root causes of Docker failures.


## 🎯 Why Docker Doctor?
────────────────────────────────────

Explain the problem with normal Docker debugging.

Without Docker Doctor:
    Docker failure
        ↓
    docker ps
        ↓
    docker logs
        ↓
    inspect network
        ↓
    inspect environment
        ↓
    manually find root cause

With Docker Doctor:
    Docker environment
        ↓
    Collect facts
        ↓
    Analyze dependencies
        ↓
    Diagnose failures
        ↓
    Rank root causes
        ↓
    Actionable report


## ✨ Features
────────────────────────────────────

### Docker Environment
- Docker daemon detection
- Container discovery
- Container status analysis

### Service Detection
- PostgreSQL
- MySQL
- Redis
- Kafka
- ZooKeeper

### Failure Detection
- Connection refused
- Connection timeout
- Permission denied
- Command/executable failures
- Authentication failures
- Unknown container failures

### Network Diagnostics
- Docker network inspection
- Container network comparison
- DNS/hostname resolution failures
- Missing shared networks

### Database Diagnostics
- localhost database configuration
- PostgreSQL configuration diagnostics
- MySQL configuration diagnostics

### Kafka Diagnostics
- Bootstrap server failures
- Missing Kafka broker
- Stopped Kafka broker
- Kafka network problems
- Kafka configuration issues

### Root Cause Analysis
- Dependency graph
- Root-cause ranking
- Affected-service detection
- Confidence scoring


## 🧠 How It Works
────────────────────────────────────

Explain architecture visually.

Docker
   ↓
State Collector
   ↓
Diagnostic Engine
   ↓
 ┌───────────────┐
 │ Log Analysis  │
 │ Network       │
 │ DNS           │
 │ Database      │
 │ Kafka         │
 └───────────────┘
   ↓
Dependency Graph
   ↓
Root Cause Analyzer
   ↓
Final Report


## 🏗️ Architecture
────────────────────────────────────

Explain each major layer.

### 1. Docker State Collection

Collects:
- containers
- status
- networks
- environment variables
- ports
- detected services

### 2. Diagnostic Rules

Each rule analyzes one type of failure.

### 3. Dependency Resolver

Determines relationships such as:

backend → postgres
backend → redis
order-service → kafka

### 4. Root Cause Analyzer

Ranks problems based on:
- severity
- confidence
- dependency relationships
- failure evidence

### 5. Report Formatter

Converts diagnostics into a readable CLI report.


## 📂 Project Structure
────────────────────────────────────

docker-doctor/
│
├── src/
│   ├── cli.ts
│   │
│   ├── diagnostics/
│   │   ├── daemon.ts
│   │   ├── containers.ts
│   │   ├── containerLogs.ts
│   │   ├── containerNetworks.ts
│   │   ├── containerEnv.ts
│   │   └── containerPorts.ts
│   │
│   ├── rules/
│   │   ├── errorPatterns.ts
│   │   ├── containerStatus.ts
│   │   ├── serviceDetection.ts
│   │   ├── databaseConnection.ts
│   │   ├── networkConnectivity.ts
│   │   ├── dnsResolution.ts
│   │   ├── kafkaDiagnosis.ts
│   │   └── dependencyResolver.ts
│   │
│   ├── engine/
│   │   ├── dockerState.ts
│   │   ├── diagnosticEngine.ts
│   │   ├── dependencyGraph.ts
│   │   ├── rootCauseAnalyzer.ts
│   │   └── resultPrinter.ts
│   │
│   └── types.ts
│
├── examples/
│   └── network-test/
│       └── compose.yml
│
├── package.json
├── tsconfig.json
├── LICENSE
├── README.md
└── .gitignore


##  Tech Stack
────────────────────────────────────

| Technology | Purpose |
|------------|---------|
| TypeScript | CLI implementation |
| Node.js | Runtime |
| Docker CLI | Docker inspection |
| Docker Compose | Testing |
| tsx | Development execution |


##  Requirements
────────────────────────────────────

- Node.js 22+
- Docker Desktop / Docker Engine
- npm
- Git


##  Installation
────────────────────────────────────

### Clone

git clone <https://github.com/pranayyyy6/docker-doctor.git>

cd docker-doctor

### Install dependencies

npm install

### Build

npm run build


## ▶️ Usage
────────────────────────────────────

### Development

npm run dev

### Production

npm run build
npm start


##  Example Output (simplified)
────────────────────────────────────

Show an actual output example.

Example:

🐳 Docker Doctor
================

✓ Docker daemon is running

Containers
----------

backend → Up
postgres → Up
redis → Exited (1)

Detected Services
-----------------

✓ postgres → postgres
  Default port: 5432

✓ redis → redis
  Default port: 6379

ROOT CAUSES
-----------

1. ROOT CAUSE | redis
   Redis container is not running

   Evidence:
   - Status: Exited (1)

   Recommendation:
   Start the Redis container and inspect its logs.

Affected Services
-----------------

...


##  Diagnostics Explained
────────────────────────────────────

Explain what each diagnostic actually means.

### Connection Refused

Meaning:
The application reached the requested address,
but no service accepted the connection.

Common causes:
- target container stopped
- wrong port
- service not listening

### Database localhost

Meaning:
Inside a container, localhost refers to that
container itself.

Bad:

DATABASE_HOST=localhost

Better:

DATABASE_HOST=postgres


### DNS / Hostname Failure

Example:

UnknownHostException: postgres

Docker Doctor checks whether:
- the target container exists
- containers share a network
- hostname matches a service


### Kafka Bootstrap Failure

Example:

No resolvable bootstrap urls given in bootstrap.servers

Docker Doctor checks:
- configured broker hostname
- broker existence
- broker status
- shared Docker network
- Kafka configuration indicators


##  Testing
────────────────────────────────────

Explain how to reproduce diagnostics.

Example:

cd examples/network-test

docker compose up -d

cd ../..

npm run dev

Expected diagnosis:

Database is configured to use localhost


##  Design Principles
────────────────────────────────────

### Local-first

No Docker state needs to be uploaded
to an external service.

### Deterministic

The same Docker state should produce
the same diagnostic result.

### Evidence-driven

Every diagnosis should provide evidence.

### Actionable

The tool should tell the developer
what to investigate or change.

### Explainable

Docker Doctor should explain
WHY something is considered a problem.


##  Current Limitations
────────────────────────────────────

Be honest about what v1 does not do.

- Does not automatically modify Docker configuration
- Does not restart containers automatically
- Does not perform arbitrary network probing
- Service detection is based on known patterns
- Diagnostic rules are intentionally deterministic


##  Roadmap
────────────────────────────────────

### Completed

- Docker daemon detection
- Container discovery
- Log analysis
- Network analysis
- Database diagnostics
- Kafka diagnostics
- Dependency graph
- Root-cause ranking
- CLI report

### Future

- Automated connectivity checks
- More database/service integrations
- Configuration validation
- Unit/integration test suite
- Better diagnostic explanations
- Plugin-based diagnostic rules


##  Contributing
────────────────────────────────────

Explain:

1. Fork repository
2. Create branch
3. Add/change diagnostic rule
4. Test locally
5. Submit pull request

Example:

git checkout -b feature/new-diagnostic
git commit -m "feat: add new diagnostic"
git push origin feature/new-diagnostic


## 🔐 Security
────────────────────────────────────

Explain:

- Docker Doctor runs locally.
- Environment variables are inspected locally.
- Sensitive values should not be included in bug reports.
- Do not commit `.env` files.


## 📄 License
────────────────────────────────────

MIT License

Copyright (c) 2026 Pranay


## 👨‍💻 Author
────────────────────────────────────

Pranay




## ⭐ Support
────────────────────────────────────

If Docker Doctor is useful:

⭐ Star the repository
🐛 Report issues
💡 Suggest diagnostics
🤝 Contribute
