# Qualifyd

Qualifyd is a platform for creating and managing realistic technical assessments that evaluate job candidates in work-like scenarios. Instead of traditional coding challenges, Qualifyd enables you to observe how candidates perform in realistic environments that simulate actual job responsibilities.

## Use Cases

Place candidates in practical testing scenarios such as:

- Kubernetes configuration and troubleshooting challenges
- Linux systems administration and optimization tasks
- Container orchestration across different technologies
- Security hardening for systems and infrastructure
- And many more job-specific technical challenges

Which could be used to hire:

- Platform Engineers
- DevOps Engineers
- Site Reliability Engineers
- Infrastructure Engineers
- Cloud Engineers
- Network Engineers
- DevSecOps Engineers
- Security Engineers
- Database Administrators
- System Administrators
- Solutions Architects
- Software Engineers

## MVP Features

- Platform foundation similar to [Killercoda](https://killercoda.com/) with assessment environments
- Technical recruiter:
  - Can define "task templates" with single/multiple steps and clear validation criteria
  - Can define "assessment templates" composed of single/multiple tasks with optional dependency relationships (i.e. to complete task Y, you need to complete task X beforehand)
  - Can select from pre-defined environment templates (K8s/Linux/Docker) with standard configurations
  - Can create assessments for a candidate from a assessment template
  - Can clone existing templates with version control and audit history
  - Can prepare environments - install software, configure services, or introduce a specific issue
  - Can implement readiness checks via a custom script
  - Can implement automatic scoring via multiple validation scripts
  - Can save environment snapshots for consistent test environments
  - Can define assessment parameters:
    - Test duration with configurable time limits
    - Scheduled test start/end times with timezone support
    - Score thresholds with weighted assessment components
    - Scenario weight within overall evaluation
    - Time-based bonus point allocation with configurable coefficients
    - Network policy controls for internet access
    - Environment familiarization period options
    - Post-test solution visibility settings
    - Environment persistence for post-test review
- Testing environments:
  - Created on-demand with just-in-time provisioning before the assessment
  - Isolated with proper network segmentation
  - Resource-constrained with configurable limits
  - Monitored for availability and performance
  - Automatically cleaned up after test completion
  - Snapshotted after the assessment for post-test review (configurable, with retention period)
- Candidate experience:
  - SSO authentication and secure registration workflow
  - Time-bound access to isolated assessment environments
  - Browser-based terminal with required tooling pre-installed
  - Real-time progress tracking and time management
  - Configurable post-test feedback and scoring display
- Reviewers have access to:
  - Command history with timestamps and execution results
  - Environment state snapshots at key assessment milestones
  - Automated test results with scoring breakdown
  - Performance metrics including resource utilization and completion time
- Organization management:
  - Secure organization profile with multi-tenant isolation
  - Role-based access control with specialized roles:
    - Admin: Full control over organization management, users, roles, billing and quotas
    - Template Editor: Creates and manages assessment content (environments, tasks, templates)
    - Recruiter: Manages candidate pool and schedules assessments
    - Reviewer: Evaluates candidate performance and provides feedback
    - Candidate: Takes assessments with restricted view
  - Usage tracking and resource allocation monitoring
  - Basic reporting and assessment analytics

### Future Roadmap

- Expand Domain Coverage
  - Programming languages (Python, Go, etc.) - to cover a broader market
  - CI/CD workflows (GitLab CI, GitHub Actions)
  - Infrastructure as Code scenarios (Terraform, more?)
  - Cloud provider environments (AWS, GCP, Azure)
  - Security-focused assessments (broad range)

- Platform Enhancements
  - Evaluation path and template versioning
  - Template marketplace for cross-organization sharing
  - Tagging system for improved organization
  - Advanced role-based access control
  - Custom machine image support for diverse environments

### Scenarios sources

- [Killercoda](https://killercoda.com/)
- [Play with Docker](https://training.play-with-docker.com/)
- [Docker Labs](https://labs.play-with-docker.com/)
- [Katacoda scenarios](https://github.com/orgs/katacoda-scenarios/repositories?type=source)
- [Linux Survival](https://linuxsurvival.com/)
- [Linux Journey](https://linuxjourney.com/)
- [Linux Command](https://linuxcommand.org/)

## Why Qualifyd?

Traditional technical assessment platforms:

- [DevSkiller](https://devskiller.com/)
- [Qualified](https://www.qualified.io/)
- [Coderbyte](https://coderbyte.com/)

often have limitations, such as:

- High Costs - Expensive evaluation environments
- Lack of Transparency - "Contact sales" barriers before platform access
- Artificial Challenges - Reliance on memorizable coding puzzles rather than work-like scenarios
- Inflexibility - Inability to adapt to diverse assessment requirements
- Poor UX - Unfamiliar interfaces and workflows that distract from assessment
- Inadequate/Limited Feedback - Limited insights for candidates on performance
- Lack of Access to Industry-Standard Tools and CLIs
- Lack of custom scenario support for organization-specific tech stacks and workflows

Qualifyd addresses these limitations by providing realistic, configurable environments that accurately simulate job responsibilities for infrastructure, platform engineering, and DevOps roles - aiming at improving the evaluation accuracy, being transparent about typical technical challenges encountered in the job, and providing a better experience for candidates and reviewers.

## Pricing

### Plans

| Feature | Starter | Team | Enterprise |
|---------|---------|------|------------|
| Price | $100/month | $200/month | Custom |
| Assessments per month | Up to 10 | Up to 40 | Unlimited |
| Team members | Up to 10 | ∞ | ∞ |
| Custom templates | 5 | 20 | Unlimited |
| Concurrent environments | 2 | 10 | Configurable |
| Available machine tiers | Standard only | Basic, Standard, Performance | All tiers + Custom |
| Included environment minutes/month¹ | 900 | 3600 | Configurable |
| Overage rate (Standard tier) | $0.20/min | $0.15/min | $0.10/min |
| Environment runtime | Up to 2 hours | Up to 8 hours | Configurable |
| Snapshot storage | Up to 7 days | Up to 30 days | Configurable |
| Internet access for environments | ✓ | ✓ | ✓ |
| RBAC | Basic | Custom | Custom |
| Priority support (Slack, Teams, Email...) | - | ✓ | ✓ |
| Automatic scoring | - | ✓ | ✓ |
| Custom machine images | - | - | ✓ |
| SLA | 99% | 99.5% | 99.9% |

¹ - machine startup time is always free and does not count towards the included minutes

### Machine Tiers

| Tier | CPU | RAM | Storage | Best for |
|------|-----|-----|---------|----------|
| Basic | 1 CPU | 2GB | 20GB | Simple programming tasks, shell scripting, web development |
| Standard | 2 CPU | 4GB | 50GB | General DevOps, containerized applications, databases |
| Performance | 4 CPU | 8GB | 80GB | Kubernetes, data processing, complex build environments |
| Custom | Configurable | Configurable | Configurable | Specialized workloads (Enterprise plan only) |

Minutes are consumed at different rates depending on the machine tier:

- Basic tier = 0.5× Standard rate (half the standard rate)
- Standard tier = 1.0× (baseline)
- Performance tier = 2.0× Standard rate (twice the standard rate)

### Additional Resources

All plans include:

- Basic templates library
- Candidate feedback tools
- SSO integration
- Dedicated support

### Enterprise Features

For organizations with specific requirements, our Enterprise plan offers:

- Custom environment configurations
- Scenario preparation
- Volume discounts
- Advanced RBAC
- Priority support
- Custom integrations

Need custom features? Contact us and figure it out!

## Project Status

This project is in early development, and the name "Qualifyd" is provisional. Alternative names under consideration:

- Veryfye
- TrueEnv
- Worklike
- RealCheck

## Infrastructure Setup

Technology stack:

- Frontend: [Next.js](https://github.com/vercel/next.js/) + [TailwindCSS](https://github.com/tailwindlabs/tailwindcss) + [shadcn/ui](https://ui.shadcn.com/)
- Backend: Go + [Chi](https://github.com/go-chi/chi) for the API + [jackc/pgx](https://github.com/jackc/pgx) for the database
- Database: PostgreSQL
- Queue system: RabbitMQ

The infrastructure should be deployed in GCP's GKE. The environments users will be using should be deployed via `KubeVirt`, which will deploy the virtual machines in the same GKE cluster.

## TODO

### Core Infrastructure

- [/] Initial project structure setup
  - [/] Frontend Next.js application structure
  - [/] Backend Go application structure
  - [/] Docker containerization configuration
  - [ ] CI/CD pipeline integration
- [ ] Backend API completion
  - [/] Initial Go module setup with dependencies
  - [/] Basic HTTP server setup with Chi router
  - [ ] API endpoints for all core functionality
  - [ ] Authentication and authorization middleware
  - [ ] Integration with database models
  - [ ] API documentation and OpenAPI specification
  - [ ] llms.txt documentation for the API
- [ ] Database schema and migrations
  - [/] Database connection setup with pgx
  - [/] Migrations directory structure
  - [ ] Organization and user models
  - [ ] Assessment and template models
  - [ ] Environment configuration models
  - [ ] Results and scoring models
- [ ] Virtual Machine infrastructure
  - [/] Initial Kubernetes configuration
  - [ ] KubeVirt integration for VM deployment
    - [ ] Local setup with KubeVirt for MacOS
  - [ ] Resource allocation and constraints implementation
  - [ ] Network segmentation and security policies
  - [ ] on-demand (JIT) provisioning system
- [ ] Monitoring and observability
  - [ ] Environment health monitoring
  - [ ] Performance metrics collection
  - [ ] Resource utilization tracking
  - [ ] Alerting for environment issues
- [ ] Security infrastructure
  - [ ] SSO authentication integration
  - [ ] Network policy controls for internet access
  - [ ] Secure environment isolation
  - [ ] SSH-based terminal access
  - [ ] Audit logging for security events

### Environment Management

- [ ] Environment templates system
  - [ ] Pre-defined environment templates (K8s/Linux/Docker/...)
  - [ ] Custom environment template creation (from pre-defined templates/from existing custom environments)
  - [ ] Software installation and configuration
  - [ ] Environment validation mechanisms
- [ ] Test environments lifecycle management
  - [ ] Creating environments from templates
  - [ ] Environment snapshotting capabilities
    - [ ] Ability to snapshot the environment on-demand
    - [ ] Automatic snapshotting after assessment completion
  - [ ] Environment restoration from snapshots
    - [ ] Ability to create a new environment from a snapshot
  - [ ] Automatic cleanup after assessment completion
  - [ ] Environment persistence configuration for post-test review
- [ ] Make the terminal connection more reliable/robust
  - [/] Initial WebSocket terminal connection
  - [ ] WebSocket connection management
  - [ ] Session persistence and recovery
  - [ ] Terminal resize handling
  - [ ] Input/output buffering improvements

### Assessment Framework

- [ ] Task template system
  - [ ] Single/multiple step definition interface
  - [ ] Validation criteria configuration
  - [ ] Dependency relationship management
  - [ ] Cloning and versioning capabilities
- [ ] Assessment template system
  - [ ] Combining tasks into assessment flows
  - [ ] Time limit configuration
  - [ ] Scoring weight configuration
  - [ ] Readiness check implementation
- [ ] Validation and scoring system
  - [ ] Custom validation script support
  - [ ] Automatic scoring implementation
  - [ ] Time-based bonus point allocation
  - [ ] Score threshold configuration

### Candidate Experience

- [ ] Assessment interface
  - [/] Initial UI scaffolding with Next.js and TailwindCSS
  - [/] Basic UI components with shadcn/ui
  - [ ] Time tracking and progress indicators
  - [ ] Task instructions and requirements display
  - [ ] File-system view that allows the candidate to move around the file-system and modify files
    - [ ] Embedded code editor (like VSCode)
  - [/] Basic browser-based terminal prototype
  - [ ] Browser-based terminal with pre-installed tools
  - [ ] Notebook for the candidate to take notes during the assessment
  - [ ] Real-time validation feedback
  - [ ] Time management and notifications
  - [ ] Audio reminders for the candidate to stay on track

### Reviewer Experience

- [ ] Assessment review interface
  - [ ] Automatic scoring script execution
  - [ ] "Terminal" view that allows the reviewer to see the terminal output of the candidate in real-time
  - [ ] "Recording" mechanism for the terminal session
    - [ ] Capture terminal input & output
    - [ ] Playback controls for reviewers
  - [ ] File-system view for reviewing candidate changes
  - [ ] Command history with timestamps and execution results
  - [ ] Performance metrics visualization
  - [ ] Environment snapshot navigation
  - [ ] Scoring breakdown and explanation
  - [ ] Reviewer annotation and feedback tools
  - [ ] Notebook for the reviewer to take notes during review

### Organization Management

- [ ] Multi-tenant architecture
  - [/] Initial database schema design for multi-tenancy
  - [ ] Organization isolation
  - [ ] Resource allocation per organization
  - [ ] Usage tracking and limits
- [ ] RBAC implementation
  - [/] Basic RBAC schema design
  - [/] Specialized roles (Admin, Template Editor, Recruiter, Reviewer, Candidate)
  - [ ] Custom roles and permissions
  - [ ] Role assignment and management
  - [ ] Proper standardized logging and monitoring
  - [ ] Audit logs for access and changes
  - [ ] Ability to manage users and roles
- [ ] Content management
  - [ ] CRUD for: assessments, assessment templates, task templates, environment templates
  - [ ] CRUD for: users, roles, organizations, integrations, settings, logs
  - [ ] Assessment creation (from assessment template), management, and scheduling
    - [ ] Email notifications to candidates for scheduled assessments
    - [ ] Email notifications to reviewers for new assignments
  - [ ] Template cloning and versioning
    - [ ] Ability to create a new assessment template from an existing assessment template
    - [ ] Ability to create a new task template from an existing task template
- [ ] Reporting and analytics
  - [ ] Assessment completion metrics
  - [ ] Scoring analytics and trends
  - [ ] Resource usage reporting
  - [ ] User activity monitoring

### Deployment and Operations

- [/] Initial infrastructure planning
  - [/] Technology stack selection
  - [/] Deployment architecture design
- [ ] CI/CD pipeline setup
  - [ ] Automated testing
  - [ ] Deployment workflows
  - [ ] Version management
- [ ] Infrastructure as Code
  - [/] Initial Kubernetes configuration files
  - [ ] Terraform configurations for GCP/GKE
  - [ ] Kubernetes manifests for application components
  - [ ] KubeVirt configurations for VM management
- [ ] Documentation
  - [/] Initial README with project overview
  - [/] Feature descriptions and pricing models
  - [ ] Installation and deployment guides
- [ ] Backup and disaster recovery
  - [ ] Database backup procedures
  - [ ] Environment snapshot retention policies
  - [ ] Recovery workflows
