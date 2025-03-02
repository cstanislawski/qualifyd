# Qualifyd

Qualifyd is a platform for creating and managing realistic technical assessment environments that evaluate job candidates in work-like scenarios. Instead of traditional coding challenges, Qualifyd enables you to observe how candidates perform in realistic environments that simulate actual job responsibilities.

## Use Cases

Place candidates in practical testing scenarios such as:

- Troubleshooting Kubernetes configuration issues
- Diagnosing and resolving Linux server problems
- Creating docker-compose configurations for new services
- Writing Terraform configurations for cloud infrastructure
- And many more job-specific technical challenges

## MVP Features

- Site like [Killercoda](https://killercoda.com/)
- Technical recruiter:
  - can define a "evaluation path", which is composed of multiple testing scenarios
  - can choose from a set of pre-defined templates (K8s/Linux)
  - can create a single step / multi-step testing scenario(s) for K8s/Docker/Linux - a "template" for the testing scenario
  - can copy an existing template to create a new one
  - can create a new template from scratch
  - can interact with the machine - install software, break stuff, etc, i.e.: prepare the testing environment
  - set up readiness scripts, automatic scoring checks
  - we snapshot the machine & spin up new machines from it shortly before the test, verifying its state by the readiness scripts
  - can define/decide:
    - the test duration
    - the test start time
    - the test end time
    - the test score threshold
    - the test scenario weight
    - if there are bonus points for completing the test before the time ends, and how much per second
    - if the machine should be given access to the internet
    - if the candidate should be given access to the environment beforehand to familiarize themselves with it
    - whether to show the correct answer to the candidate after the test
    - whether to snapshot the machine after the test for manual review
- The testing scenario gets created shortly before the test
- Candidate:
  - can login via SSO / register beforehand
  - is given temporary access to a machine & instructions, with a timer
  - is presented a terminal where they can run commands
  - can see the score & results after the test (configurable by the recruiter)
- The reviewers see everything created by the user in the testing scenario, as well as bash history, automatic test results & score
- Companies:
  - can create a company profile
  - can invite members to the company & define their role - admin, editor, viewer (basic roles for now)

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
- Lack of custom scenario support for company-specific tech stacks and workflows

Qualifyd addresses these limitations by providing realistic, configurable environments that accurately simulate job responsibilities for infrastructure, platform engineering, and DevOps roles - aiming at improving the evaluation accuracy, being transparent about typical technical challenges encountered in the job, and providing a better experience for candidates and reviewers.

## Pricing

### Plans

| Feature | Starter | Team | Enterprise |
|---------|---------|------|------------|
| Price | $100/month | $200/month | Custom |
| Assessments per month | Up to 10 | Up to 40 | Unlimited |
| Team members | Up to 5 | ∞ | ∞ |
| Custom templates | 5 | 20 | Unlimited |
| Concurrent environments | 3 | 10 | Configurable |
| Included environment minutes/month (2cpu/4gb/50gb as baseline)¹ | 900 | 3600 | Configurable |
| Overage rate (2cpu/4gb/50gb as baseline) | $0.20/min | $0.15/min | $0.10/min |
| Custom machine sizes | - | ✓ | ✓ |
| Environment runtime | Up to 2 hours | Up to 8 hours | Configurable |
| Snapshot storage | Up to 7 days | Up to 30 days | Configurable |
| Internet access for environments | ✓ | ✓ | ✓ |
| RBAC | Basic | Custom | Custom |
| Priority support (Slack, Teams, Email...) | - | ✓ | ✓ |
| Automatic scoring | - | ✓ | ✓ |
| Custom machine images | - | - | ✓ |
| SLA | 98% | 99.5% | 99.9% |

The offer does not match your needs? Contact us and we'll work something out!

¹ - machine startup time is always free and does not count towards the included minutes

(not final, just a placeholder/proposal)

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
- Queue system: TBD

The infrastructure should be deployed in GCP's GKE. The environments users will be using should be deployed via `KubeVirt`, which will deploy the virtual machines in the same GKE cluster.
